/**
 * Created by sam on 12.02.2015.
 */
import {isFunction, constant, argList, mixin, search, hash, resolveIn} from '../index';
import {get as getData, remove as removeData, upload, list as listData} from '../data';
import * as graph from '../graph';
import {IDType, SelectOperation, defaultSelectionType, resolve as resolveIDType} from '../idtype';
import {Range, list as rlist, Range1D, all} from '../range';
import {isDataType, IDataType, IDataDescription, DataTypeBase} from '../datatype';
import {list as listPlugins, load as loadPlugin} from '../plugin';
import * as session from '../session';

/**
 * reexport the edge type
 */
export type GraphEdge = graph.GraphEdge;
export const graphModule = graph;

/**
 * list of categories for actions and objects
 */
export const cat = {
  data: 'data',
  selection: 'selection',
  visual: 'visual',
  layout: 'layout',
  logic: 'logic',
  custom: 'custom',
  annotation: 'annotation'
};

/**
 * list of operations
 */
export const op = {
  create: 'create',
  update: 'update',
  remove: 'remove'
};


/**
 * an object reference is a common description of an object node in the provenance graph
 */
export interface IObjectRef<T> {
  /**
   * name of the object
   */
  name: string;
  /**
   * category one of categories
   */
  category : string;
  /**
   * the value
   */
  v : Promise<T>;

  /**
   * maybe null if not defined
   */
  value: T;

  /**
   * a hash for avoiding false duplicate detection
   */
  hash: string;
}

/**
 * creates an object reference to the given object
 * @param v
 * @param name
 * @param category
 * @param hash
 * @returns {{v: T, name: string, category: string}}
 */
export function ref<T>(v:T, name:string, category = cat.data, hash = name + '_' + category):IObjectRef<T> {
  return {
    v: Promise.resolve(v),
    value: v,
    name: name,
    category: category,
    hash: hash
  };
}

export interface IInverseActionCreator {
  (inputs:IObjectRef<any>[], creates:IObjectRef<any>[], removes:IObjectRef<any>[]) : IAction;
}

export interface ICmdResult {
  /**
   * the command to revert this command
   */
  inverse : IAction | IInverseActionCreator;
  /**
   * the created references
   */
  created? : IObjectRef<any>[];
  /**
   * the removed references
   */
  removed? : IObjectRef<any>[];

  /**
   * then number of actual milliseconds consumed
   */
  consumed?: number;
}

/**
 * abstract definition of a command
 */
export interface ICmdFunction {
  (inputs:IObjectRef<any>[], parameters:any, graph:ProvenanceGraph, within:number) : Promise<ICmdResult> | ICmdResult;
}
/**
 * a factory to create from an id the corresponding command
 */
export interface ICmdFunctionFactory {
  (id:string): ICmdFunction;
}

/**
 * tries to persist an object value supporting datatypes and DOM elements having an id
 * @param v
 * @returns {any}
 */
function persistData(v:any):any {
  if (v instanceof Element) {
    let e = <Element>v,
      id = e.getAttribute('id');
    return {type: 'element', id: id};
  }
  if (isDataType(v)) {
    let e = <IDataType>v;
    return {type: 'dataset', id: e.desc.id, persist: e.persist()};
  }
  if (typeof v === 'string' || typeof v === 'number') {
    return {type: 'primitive', v: v};
  }
  return null;
}

function restoreData(v:any):any {
  if (!v) {
    return null;
  }
  switch (v.type) {
    case 'element':
      if (v.id) {
        return Promise.resolve(document.getElementById(v.id));
      }
      return null;
    case 'dataset':
      return getData(v.persist);
    case 'primitive':
      return Promise.resolve(v.v);
  }
  return null;
}

/**
 * a graph node of type object
 */
export class ObjectNode<T> extends graph.GraphNode implements IObjectRef<T> {
  /**
   * a promise of the value accessible via .v
   */
  private _promise:Promise<T>;
  private _persisted:any = null;

  constructor(private _v:T, name:string, category = cat.data, hash = name + '_' + category, description = '') {
    super('object');
    if (_v != null) { //if the value is given, auto generate a promise for it
      this._promise = Promise.resolve(_v);
    }
    super.setAttr('name', name);
    super.setAttr('category', category);
    super.setAttr('hash', hash);
    super.setAttr('description', description);
  }

  get value() {
    this.checkPersisted();
    return this._v;
  }

  set value(v:T) {
    this._v = v;
    this._promise = v== null ? null : Promise.resolve(v);
    this._persisted = null;
  }

  /**
   * checks whether the persisted value was already restored
   */
  private checkPersisted() {
    if (this._persisted != null) {
      this._promise = restoreData(this._persisted);
      if (this._promise) {
        this._promise.then((v) => {
          this._v = v;
        });
      }
      this._persisted = null;
    }
  }

  get v() {
    this.checkPersisted();
    return this._promise;
  }

  get name():string {
    return super.getAttr('name', '');
  }

  get category():string {
    return super.getAttr('category', '');
  }

  get hash():string {
    return super.getAttr('hash', '');
  }

  get description():string {
    return super.getAttr('description', '');
  }


  persist() {
    var r = super.persist();
    if (!r.attrs) {
      r.attrs = {};
    }
    r.attrs.v = this._persisted ? this._persisted : persistData(this.value);
    return r;
  }

  restore(p:any) {
    this._persisted = p.attrs.v;
    delete p.attrs.v;
    super.restore(p);
    return this;
  }

  static restore(p) {
    var r = new ObjectNode<any>(null, p.attrs.name, p.attrs.category, p.attrs.hash || p.attrs.name + '_' + p.attrs.category);
    return r.restore(p);
  }

  get createdBy() {
    var r = this.incoming.filter(graph.isType('creates'))[0];
    return r ? <ActionNode>r.source : null;
  }

  get removedBy() {
    var r = this.incoming.filter(graph.isType('removes'))[0];
    return r ? <ActionNode>r.source : null;
  }

  get requiredBy() {
    return this.incoming.filter(graph.isType('requires')).map((e) => <ActionNode>e.source);
  }

  get partOf() {
    return this.incoming.filter(graph.isType('consistsOf')).map((e) => <StateNode>e.source);
  }

  toString() {
    return this.name;
  }
}
