/**
 * Created by Samuel Gratzl on 04.08.2014.
 */

'use strict';
import C = require('./main');
import ajax = require('./ajax');
import ranges = require('./range');
import idtypes = require('./idtype');
import datatypes = require('./datatype');
import math = require('./math');
import def = require('./vector');

/**
 * base class for different Vector implementations, views, transposed,...
 */
export class VectorBase extends idtypes.SelectAble {
  constructor(public _root:def.IVector) {
    super();
  }

  get dim() {
    return [this.length];
  }

  data() : Promise<any[]> {
    throw new Error('not implemented');
  }

  size():number {
    throw new Error('not implemented');
  }

  get length() {
    return this.size();
  }

  view(range:ranges.Range = ranges.all()):def.IVector {
    return new VectorView(this._root, range);
  }

  idView(idRange:ranges.Range = ranges.all()) : Promise<def.IVector> {
    return this.ids().then((ids) => this.view(ids.indexOf(idRange)));
  }

  stats() : Promise<math.IStatistics> {
    return this.data().then((d) => math.computeStats(d));
  }

  get indices() : ranges.Range {
    return ranges.range(0, this.length);
  }

  /**
   * return the range of this vector as a grouped range, depending on the type this might be a single group or multiple ones
   */
  groups(): Promise<ranges.CompositeRange1D> {
    var v = this._root.valuetype;
    if (v.type === 'categorical') {
      return this.data().then((d) => {
        var options: any = {
          name: this._root.desc.id
        };
        if (v.categories[0].color) {
          options.colors = v.categories.map((d) => d.color);
        }
        return datatypes.categorical2partitioning(d, v.categories.map((d) => typeof d === 'string' ? d : d.name), options);
      });
    } else {
      return Promise.resolve(ranges.composite(this._root.desc.id, [ ranges.asUngrouped(this.indices.dim(0))]));
    }
  }

  hist(bins? : number) : Promise<math.IHistogram> {
    var v = this._root.valuetype;
    return this.data().then((d) => {
      switch(v.type) {
      case 'categorical':
          return math.categoricalHist(d, this.indices.dim(0), d.length, v.categories.map((d) => typeof d === 'string' ? d : d.name));
      case 'real':
      case 'int':
        return math.hist(d, this.indices.dim(0), d.length, bins ? bins : Math.round(Math.sqrt(this.length)), v.range);
      default:
          return null; //cant create hist for unique objects or other ones
      }
    });
  }

  every(callbackfn: (value: any, index: number) => boolean, thisArg?: any): Promise<boolean> {
    return this.data().then((d) => d.every(callbackfn, thisArg));
  }

  some(callbackfn: (value: any, index: number) => boolean, thisArg?: any): Promise<boolean> {
    return this.data().then((d) => d.some(callbackfn, thisArg));
  }

  forEach(callbackfn: (value: any, index: number) => void, thisArg?: any): void {
    this.data().then((d) => d.forEach(callbackfn, thisArg));
  }

  reduce<T,U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number) => U, initialValue: U, thisArg?: any): Promise<U> {
    function helper() {
      return callbackfn.apply(thisArg, C.argList(arguments));
    }
    return this.data().then((d) => d.reduce(helper, initialValue));
  }

  reduceRight<T,U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number) => U, initialValue: U, thisArg?: any): Promise<U> {
    function helper() {
      return callbackfn.apply(thisArg, C.argList(arguments));
    }
    return this.data().then((d) => d.reduceRight(helper, initialValue));
  }

  restore(persisted: any) {
    var r : def.IVector = <def.IVector>(<any>this);
    if (persisted && persisted.range) { //some view onto it
      r = r.view(ranges.parse(persisted.range));
    }
    return r;
  }
}

export interface IVectorLoader {
  (desc: datatypes.IDataDescription) : Promise<{
    rowIds : ranges.Range;
    rows : string[];
    data : any[];
  }>;
}


function viaAPILoader() {
  var _loader = undefined;
  return (desc) => {
    if (_loader) { //in the cache
      return _loader;
    }
    return _loader = ajax.getAPIJSON('/dataset/'+desc.id).then(function (data) {
      data.rowIds = ranges.parse(data.rowIds);
      return data;
    });
  };
}

function viaDataLoader(rows: string[], rowIds: number[], data: any[]) {
  var _data = undefined;
  return (desc) => {
    if (_data) { //in the cache
      return Promise.resolve(_data);
    }
    _data = {
      rowIds : ranges.parse(rowIds),
      rows: rows,
      data: data
    };
    return Promise.resolve(_data);
  };
}

/**
 * root matrix implementation holding the data
 */
export class Vector extends VectorBase implements def.IVector {
  valuetype:any;
  _idtype:idtypes.IDType;

  constructor(public desc:datatypes.IDataDescription, private loader : IVectorLoader) {
    super(null);
    this._root = this;
    var d = <any>desc;
    this.valuetype = d.value;
    this._idtype = idtypes.resolve(d.idtype);
  }

  get idtype() {
    return this._idtype;
  }

  /**
   * loads all the underlying data in json format
   * TODO: load just needed data and not everything given by the requested range
   * @returns {*}
   */
  load() : Promise<any> {
    return this.loader(this.desc);
  }

  /**
   * access at a specific position
   * @param i
   * @param j
   * @returns {*}
   */
  at(i) {
    return this.load().then(function (d) {
      return d.data[i];
    });
  }

  data(range:ranges.Range = ranges.all()) {
    var that = this;
    return this.load().then(function (data) {
      return range.filter(data.data, that.dim);
    });
  }

  names(range:ranges.Range = ranges.all()) {
    var that = this;
    return this.load().then(function (data) {
      return range.filter(data.rows, that.dim);
    });
  }
  ids(range:ranges.Range = ranges.all()): Promise<ranges.Range> {
    var that = this;
    return this.load().then(function (data) {
      return range.preMultiply(data.rowIds, that.dim);
    });
  }

  get idtypes() {
    return [this.idtype];
  }

  size() {
    return (<any>this.desc).size;
  }

  sort(compareFn?: (a: any, b: any) => number, thisArg?: any): Promise<def.IVector> {
    return this.data().then((d) => {
      var indices = C.argSort(d, compareFn, thisArg);
      return this.view(ranges.list(indices));
    });
  }

  map<U>(callbackfn: (value: any, index: number) => U, thisArg?: any): Promise<def.IVector> {
    //FIXME
    return null;
  }

  filter(callbackfn: (value: any, index: number) => boolean, thisArg?: any): Promise<def.IVector> {
    return this.data().then((d) => {
      var indices = C.argFilter(d, callbackfn, thisArg);
      return this.view(ranges.list(indices));
    });
  }

  persist() {
    return this.desc.id;
  }
}

/**
 * view on the vector restricted by a range
 * @param root underlying matrix
 * @param range range selection
 * @param t optional its transposed version
 * @constructor
 */
class VectorView extends VectorBase implements def.IVector {
  constructor(root:def.IVector, private range:ranges.Range) {
    super(root);
  }

  get desc() {
    return this._root.desc;
  }

  persist() {
    return {
      root: this._root.persist(),
      range: this.range.toString()
    };
  }

  size() {
    return this.range.size(this._root.dim)[0];
  }

  at(i:number) {
    var inverted = this.range.invert([i], this._root.dim);
    return this._root.at(inverted[0]);
  }

  data(range:ranges.Range = ranges.all()) {
    return this._root.data(this.range.preMultiply(range, this._root.dim));
  }

  names(range:ranges.Range = ranges.all()) {
    return this._root.names(this.range.preMultiply(range, this._root.dim));
  }
  ids(range:ranges.Range = ranges.all()) {
    return this._root.ids(this.range.preMultiply(range, this._root.dim));
  }

  view(range:ranges.Range = ranges.all()) {
    if (range.isAll) {
      return this;
    }
    return new VectorView(this._root, this.range.preMultiply(range, this.dim));
  }

  get valuetype() {
    return this._root.valuetype;
  }

  get idtype() {
    return this._root.idtype;
  }

  get idtypes() {
    return [this.idtype];
  }

  /*get indices() {
    return this.range;
  }*/

  sort(compareFn?: (a: any, b: any) => number, thisArg?: any): Promise<def.IVector> {
    return this.data().then((d) => {
      var indices = C.argSort(d, compareFn, thisArg);
      return this.view(this.range.preMultiply(ranges.list(indices)));
    });
  }

  map<U>(callbackfn: (value: any, index: number) => U, thisArg?: any): Promise<def.IVector> {
    //FIXME
    return null;
  }

  filter(callbackfn: (value: any, index: number) => boolean, thisArg?: any): Promise<def.IVector> {
    return this.data().then((d) => {
      var indices = C.argFilter(d, callbackfn, thisArg);
      return this.view(this.range.preMultiply(ranges.list(indices)));
    });
  }
}

/**
 * module entry point for creating a datatype
 * @param desc
 * @returns {def.IVector}
 */
export function create(desc: datatypes.IDataDescription): def.IVector {
  return new Vector(desc, viaAPILoader());
}

export function wrap(desc: datatypes.IDataDescription, rows: string[], rowIds: number[], data: any[]) {
  return new Vector(desc, viaDataLoader(rows, rowIds, data));
}
