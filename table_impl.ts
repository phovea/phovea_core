/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */

'use strict';
import C = require('./main');
import ajax = require('./ajax');
import ranges = require('./range');
import idtypes = require('./idtype');
import datatypes = require('./datatype');
import vector = require('./vector');
import vector_impl = require('./vector_impl');
import def = require('./table');
/**
 * base class for different Table implementations, views, transposed,...
 */
export class TableBase extends idtypes.SelectAble {
  constructor(public _root:def.ITable) {
    super();
  }

  get dim() {
    return this.size();
  }

  get nrow() {
    return this.dim[0];
  }

  get ncol() {
    return this.dim[1];
  }

  size():number[] {
    throw new Error('not implemented');
  }

  view(range:ranges.Range = ranges.all()):def.ITable {
    return new TableView(this._root, range);
  }

  idView(idRange:ranges.Range = ranges.all()) : Promise<def.ITable> {
    return this.ids().then((ids) => this.view(ids.indexOf(idRange)));
  }

  reduce(f : (row : any[]) => any, this_f? : any, valuetype? : any, idtype? : idtypes.IDType) : vector.IVector {
    return new MultITableVector(<def.ITable>(<any>this), f, this_f, valuetype, idtype);
  }

  restore(persisted: any) : C.IPersistable {
    if (persisted && persisted.f) {
      /* tslint:disable:no-eval */
      return this.reduce(eval(persisted.f), this, persisted.valuetype, persisted.idtype ? idtypes.resolve(persisted.idtype) : undefined);
      /* tslint:enable:no-eval */
    } else if (persisted && persisted.range) { //some view onto it
      return this.view(ranges.parse(persisted.range));
    } else {
      return <C.IPersistable>(<any>this);
    }
  }
}

export interface ITableLoader {
  (desc: datatypes.IDataDescription) : Promise<{
    rowIds : ranges.Range;
    rows: string[];
    objs : any[];
    data : any[][];
  }>;
}

function toObjects(data: any[][], vecs) {
  return data.map((row) => {
    var r : any = {};
    vecs.forEach((col, i) => {
      r[col.name] =  datatypes.mask(row[i], col.value);
    });
    return r;
  });
}

function viaAPILoader() {
  var _loader = undefined;
  return (desc) => {
    if (_loader) { //in the cache
      return _loader;
    }
    return _loader = ajax.getAPIJSON('/dataset/'+desc.id).then(function (data) {
      data.rowIds = ranges.parse(data.rowIds);
      //transpose to have column order for better vector access
      data.objs = toObjects(data.data, desc.columns);
      data.data = datatypes.transpose(data.data);

      //mask data
      if (desc.columns.some((col) => col.value && 'missing' in col.value)) {
       data.data = data.data.map((col, i) => datatypes.mask(col, desc.columns[i].value));
      }
      //mask the data
      return data;
    });
  };
}

function viaDataLoader(data: any[], nameProperty: any) {
  var _data : any = undefined;
  return (desc) => {
    if (_data) { //in the cache
      return Promise.resolve(_data);
    }
    var name : (any) => string = C.isFunction(nameProperty)? nameProperty : C.getter(nameProperty.toString());
    function toGetter(col) {
      if (col.getter) {
        return col.getter;
      }
      return (d) => d[col.name];
    }
    var getters = desc.columns.map(toGetter);
    var objs = data.map((row) => {
      var r = { _ : row };
      desc.columns.forEach((col, i) => {
        r[col.name] =  getters[i](row);
      });
      return r;
    });
    _data = {
      rowIds : ranges.range(0,data.length),
      rows : data.map(name),
      objs : objs,
      data : getters.map((getter) => data.map(getter))
    };
    return Promise.resolve(_data);
  };
}

/**
 * root matrix implementation holding the data
 */
export class Table extends TableBase implements def.ITable {
  rowtype:idtypes.IDType;
  private vectors : TableVector[];

  constructor(public desc:datatypes.IDataDescription, private loader : ITableLoader) {
    super(null);
    this._root = this;
    var d = <any>desc;
    this.rowtype = idtypes.resolve(d.idtype || d.rowtype);
    this.vectors = d.columns.map((cdesc, i) => new TableVector(this, i, cdesc));
  }

  /**
   * loads all the underlying data in json format
   * TODO: load just needed data and not everything given by the requested range
   * @returns {*}
   */
  load() {
    return this.loader(this.desc);
  }

  get idtypes() {
    return [this.rowtype];
  }

  col(i: number) {
    return this.vectors[i];
  }

  cols(range:ranges.Range = ranges.all()) {
    return range.filter(this.vectors, [this.ncol]);
  }

  /**
   * access at a specific position
   * @param i
   * @param j
   * @returns {*}
   */
  at(i, j) {
    return this.load().then(function (d) {
      return d.data[j][i];
    });
  }

  data(range:ranges.Range = ranges.all()) {
    var that = this;
    return this.load().then(function (data) {
      return datatypes.transpose(range.swap().filter(data.data, that.swap(that.size())));
    });
  }

  objects(range:ranges.Range = ranges.all()) {
    var that = this;
    return this.load().then(function (data) {
      //TODO filter to specific properties by the second range
      return range.filter(data.objs, that.size());
    });
  }

  /**
   * return the row ids of the matrix
   * @returns {*}
   */
  rows(range:ranges.Range = ranges.all()):Promise<string[]> {
    var that = this;
    return this.load().then(function (d:any) {
      return range.dim(0).filter(d.rows, that.nrow);
    });
  }
  rowIds(range:ranges.Range = ranges.all()) {
    var that = this;
    return this.load().then(function (data) {
      return data.rowIds.preMultiply(range, that.dim);
    });
  }
  ids(range:ranges.Range = ranges.all()) {
    return this.rowIds(range);
  }

  private swap(d : number[]) {
    return d.slice(0).reverse();
  }

  size() {
    return (<any>this.desc).size;
  }

  persist() {
    return this.desc.id;
  }

  restore(persisted: any) : C.IPersistable {
    if (persisted && typeof persisted.col === 'number') {
      return this.col(persisted.col);
    }
    return super.restore(persisted);
  }
}

/**
 * view on the vector restricted by a range
 * @param root underlying matrix
 * @param range range selection
 * @param t optional its transposed version
 * @constructor
 */
class TableView extends TableBase implements def.ITable {
  constructor(root:def.ITable, private range:ranges.Range) {
    super(root);
    this.range = range;
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

  restore(persisted: any) {
    var r : def.ITable = this;
    if (persisted && persisted.range) { //some view onto it
      r = r.view(ranges.parse(persisted.range));
    }
    return r;
  }

  size() {
    return this.range.size(this._root.dim);
  }

  at(i:number, j:number) {
    var inverted = this.range.invert([i, j], this._root.dim);
    return this._root.at(inverted[0],inverted[1]);
  }

  col(i: number) {
    var inverted = this.range.invert([0,i], this._root.dim);
    return this._root.col(inverted[1]);
  }

  cols(range:ranges.Range = ranges.all()) {
    return this._root.cols(this.range.swap().preMultiply(range, this._root.dim));
  }

  data(range:ranges.Range = ranges.all()) {
    return this._root.data(this.range.preMultiply(range, this._root.dim));
  }

  objects(range:ranges.Range = ranges.all()) {
    return this._root.objects(this.range.preMultiply(range, this._root.dim));
  }

  rows(range: ranges.Range = ranges.all()) {
    return this._root.rows(this.range.preMultiply(range, this._root.dim));
  }
  rowIds(range:ranges.Range = ranges.all()) {
    return this._root.rowIds(this.range.preMultiply(range, this._root.dim));
  }
  ids(range:ranges.Range = ranges.all()) {
    return this.rowIds(range);
  }

  view(range:ranges.Range = ranges.all()) {
    if (range.isAll) {
      return this;
    }
    return new TableView(this._root, this.range.preMultiply(range, this.dim));
  }

  get rowtype() {
    return this._root.rowtype;
  }

  get idtypes() {
    return [this.rowtype];
  }
}

/**
 * root matrix implementation holding the data
 */
export class TableVector extends vector_impl.VectorBase implements vector.IVector {
  valuetype:any;

  constructor(private table: Table, private index: number, public desc:datatypes.IDataDescription) {
    super(null);
    this._root = this;
    this.valuetype = (<any>desc).value;
    this.desc.fqname=table.desc.fqname+'/'+this.desc.name;
    this.desc.type = 'vector';
  }

  get idtype() {
    return this.table.rowtype;
  }

  get idtypes() {
    return [this.idtype];
  }

  persist() {
    return {
      root: this.table.persist(),
      col: this.index
    };
  }

  restore(persisted: any) {
    var r : vector.IVector = this;
    if (persisted && persisted.range) { //some view onto it
      r = r.view(ranges.parse(persisted.range));
    }
    return r;
  }

  /**
   * loads all the underlying data in json format
   * TODO: load just needed data and not everything given by the requested range
   * @returns {*}
   */
  private load() : Promise<any[]> {
    var that = this;
    return this.table.load().then(function (data) {
      return data.data[that.index];
    });
  }

  /**
   * access at a specific position
   * @param i
   * @param j
   * @returns {*}
   */
  at(i) {
    return this.load().then(function (d) {
      return d[i];
    });
  }

  data(range:ranges.Range = ranges.all()) {
    var that = this;
    return this.load().then(function (data) {
      return range.filter(data, that.dim);
    });
  }

  names(range:ranges.Range = ranges.all()) {
    return this.table.rows(range);
  }
  ids(range:ranges.Range = ranges.all()) {
    return this.table.rowIds(range);
  }

  size() {
    return this.table.nrow;
  }

  sort(compareFn?: (a: any, b: any) => number, thisArg?: any): Promise<vector.IVector> {
    return this.data().then((d) => {
      var indices = C.argSort(d, compareFn, thisArg);
      return this.view(ranges.list(indices));
    });
  }

  map<U>(callbackfn: (value: any, index: number) => U, thisArg?: any): Promise<vector.IVector> {
    //FIXME
    return null;
  }

  filter(callbackfn: (value: any, index: number) => boolean, thisArg?: any): Promise<vector.IVector> {
    return this.data().then((d) => {
      var indices = C.argFilter(d, callbackfn, thisArg);
      return this.view(ranges.list(indices));
    });
  }
}


/**
 * a simple projection of a matrix columns to a vector
 */
class MultITableVector extends vector_impl.VectorBase implements vector.IVector {
  desc : datatypes.IDataDescription;

  constructor(private table : def.ITable, private f : (row : any[]) => any, private this_f = table, public valuetype = null, private _idtype = table.rowtype) {
    super(null);
    this.desc = {
      name : table.desc.name+'-p',
      fqname: table.desc.fqname+'-p',
      type : 'vector',
      id : table.desc.id+'-p'
    };
    this._root = this;
  }

  get idtype() {
    return this._idtype;
  }

  get idtypes() {
    return [this.idtype];
  }

  persist() {
    return {
      root: this.table.persist(),
      f: this.f.toString(),
      valuetype: this.valuetype ? this.valuetype : undefined,
      idtype: this.idtype === this.table.rowtype ? undefined: this.idtype.name
    };
  }

  restore(persisted: any) {
    var r : vector.IVector = this;
    if (persisted && persisted.range) { //some view onto it
      r = r.view(ranges.parse(persisted.range));
    }
    return r;
  }

  size() {
    return this.table.nrow;
  }
  /**
   * return the associated ids of this vector
   */
  names(range?:ranges.Range) : Promise<string[]> {
    return this.table.rows(range);
  }
  ids(range?:ranges.Range) {
    return this.table.rowIds(range);
  }

  /**
   * returns a promise for getting one cell
   * @param i
   * @param j
   */
  at(i:number) : Promise<any> {
    return this.table.data(ranges.list(i)).then((d)=> {
      return this.f.call(this.this_f, d[0]);
    });
  }
  /**
   * returns a promise for getting the data as two dimensional array
   * @param range
   */
  data(range?:ranges.Range) : Promise<any[]> {
    return this.table.data(range).then((d)=> {
      return d.map(this.f, this.this_f);
    });
  }

  sort(compareFn?: (a: any, b: any) => number, thisArg?: any): Promise<vector.IVector> {
    return this.data().then((d) => {
      var indices = C.argSort(d, compareFn, thisArg);
      return this.view(ranges.list(indices));
    });
  }

  map<U>(callbackfn: (value: any, index: number) => U, thisArg?: any): Promise<vector.IVector> {
    //FIXME
    return null;
  }

  filter(callbackfn: (value: any, index: number) => boolean, thisArg?: any): Promise<vector.IVector> {
    return this.data().then((d) => {
      var indices = C.argFilter(d, callbackfn, thisArg);
      return this.view(ranges.list(indices));
    });
  }
}

/**
 * module entry point for creating a datatype
 * @param desc
 * @returns {def.ITable}
 */
export function create(desc: datatypes.IDataDescription): def.ITable {
  if (C.isFunction((<any>desc).loader)) {
    return new Table(desc, (<any>desc).loader);
  }
  return new Table(desc, viaAPILoader());
}

export function wrapObjects(desc: datatypes.IDataDescription, data: any[], nameProperty: string);
export function wrapObjects(desc: datatypes.IDataDescription, data: any[], nameProperty: (obj: any) => string);
export function wrapObjects(desc: datatypes.IDataDescription, data: any[], nameProperty: any) {
  return new Table(desc, viaDataLoader(data, nameProperty));
}
