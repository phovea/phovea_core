/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */

import {IPersistable, argFilter, argSort} from './index';
import {getAPIJSON, getAPIData} from './ajax';
import {Range, all, list as rlist, parse, range} from './range';
import {SelectAble, resolve as idtypes_resolve, IDType} from './idtype';
import {IDataDescription, mask, IValueType} from './datatype';
import {IVector, IVectorDataDescription} from './vector';
import {VectorBase} from './vector_impl';
import {ITable, IQueryArgs, ITableColumn, ITableDataDescription} from './table';
/**
 * base class for different Table implementations, views, transposed,...
 */
export abstract class ATableBase extends SelectAble {
  constructor(public readonly _root: ITable) {
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

  abstract size(): number[];

  view(range: Range = all()): ITable {
    return new TableView(this._root, range);
  }

  abstract queryView(name: string, args: IQueryArgs): ITable;

  idView(idRange: Range = all()): Promise<ITable> {
    return this.ids().then((ids) => this.view(ids.indexOf(idRange)));
  }

  reduce(f: (row: any[]) => any, this_f?: any, valuetype?: any, idtype?: IDType): IVector {
    return new MultITableVector(<ITable>(<any>this), f, this_f, valuetype, idtype);
  }

  restore(persisted: any): IPersistable {
    if (persisted && persisted.f) {
      /* tslint:disable:no-eval */
      return this.reduce(eval(persisted.f), this, persisted.valuetype, persisted.idtype ? idtypes_resolve(persisted.idtype) : undefined);
      /* tslint:enable:no-eval */
    } else if (persisted && persisted.range) { //some view onto it
      return this.view(parse(persisted.range));
    } else {
      return <IPersistable>(<any>this);
    }
  }
}

export interface ITableLoader {
  (desc: ITableDataDescription): Promise<{
    rowIds: Range;
    rows: string[];
    objs: any[];
  }>;
}


export interface ITableLoader2 {
  rowIds(desc: ITableDataDescription, range: Range): Promise<Range>;
  rows(desc: ITableDataDescription, range: Range): Promise<string[]>;
  col(desc: ITableDataDescription, column: string, range: Range): Promise<IValueType[]>;
  objs(desc: ITableDataDescription, range: Range): Promise<any[]>;
  data(desc: ITableDataDescription, range: Range): Promise<IValueType[][]>;
  view(desc: ITableDataDescription, name: string, args: any): ITableLoader;
}

function adapterOne2Two(loader: ITableLoader): ITableLoader2 {
  return {
    rowIds: (desc: ITableDataDescription, range: Range) => loader(desc).then((d) => range.preMultiply(d.rowIds, desc.size)),
    rows: (desc: ITableDataDescription, range: Range) => loader(desc).then((d) => range.dim(0).filter(d.rows, desc.size[0])),
    col: (desc: ITableDataDescription, column: string, range: Range) => loader(desc).then((d) => range.filter(d.objs.map((d) => d[column]), desc.size)),
    objs: (desc: ITableDataDescription, range: Range) => loader(desc).then((d) => range.filter(d.objs, desc.size)),
    data: (desc: ITableDataDescription, range: Range) => loader(desc).then((d) => range.filter(toFlat(d.objs, desc.columns), desc.size)),
    view: (desc: ITableDataDescription, name: string, args: any) => {
      throw new Error('not implemented');
    }
  };
}


function viaAPIViewLoader(name: string, args: IQueryArgs): ITableLoader2 {
  let _loader = undefined;
  return (desc) => {
    if (!_loader) { //in the cache
      _loader = getAPIJSON(`/dataset/table/${desc.id}/view/${name}`, args).then((data) => {
        data.rowIds = parse(data.rowIds);
        data.objs = maskObjects(data.data, desc);
        //mask the data
        return data;
      });
    }
    return _loader;
  };
}

function maskCol(arr: IValueType[], col: ITableColumn) {
  //mask data
  if (col.value && 'missing' in col.value) {
    return mask(arr, col.value);
  }
  return arr;
}

function maskObjects(arr: IValueType[], desc: ITableDataDescription) {
  //mask data
  if (desc.columns.some((col) => col.value && 'missing' in col.value)) {
    arr.forEach((row) => {
      desc.columns.forEach((col) => row[col.name] = mask(row[col.name], col.value));
    });
  }
  return arr;
}


function viaAPI2Loader(): ITableLoader2 {
  let rowIds = null,
    rows = null,
    cols: any = {},
    objs = null,
    data = null;
  return {
    rowIds: (desc: ITableDataDescription, range: Range) => {
      if (rowIds == null) {
        rowIds = getAPIJSON(`/dataset/table/${desc.id}/rowIds`).then(parse);
      }
      return rowIds.then((d) => d.preMultiply(range, desc.size));
    },
    rows: (desc: ITableDataDescription, range: Range) => {
      if (rows == null) {
        rows = getAPIJSON(`/dataset/table/${desc.id}/rows`);
      }
      return rows.then((d) => range.dim(0).filter(d, desc.size[0]));
    },
    objs: (desc: ITableDataDescription, range: Range) => {
      if (range.isAll) {
        if (objs == null) {
          objs = getAPIJSON(`/dataset/table/${desc.id}/raw`).then((data) => maskObjects(data, desc));
        }
        return objs;
      }
      if (objs != null) { //already loading all
        return objs.then((d) => range.filter(d, desc.size));
      }
      //server side slicing
      return getAPIData(`/dataset/table/${desc.id}/raw`, { range: range.toString() }).then((data) => maskObjects(data, desc));
    },
    data: (desc: ITableDataDescription, range: Range) => {
      if (range.isAll) {
        if (data == null) {
          data = r.objs(desc, range).then((objs) => toFlat(objs, desc.columns));
        }
        return data;
      }
      if (data != null) { //already loading all
        return data.then((d) => range.filter(d, desc.size));
      }
      //server side slicing
      return r.objs(desc, range).then((objs) => toFlat(objs, desc.columns));
    },
    col: (desc: ITableDataDescription, column: string, range: Range) => {
      const colDesc = (<any>desc).columns.find((c: any) => c.name === column);
      if (range.isAll) {
        if (cols[column] == null) {
          if (objs === null) {
            cols[column] = getAPIJSON(`/dataset/table/${desc.id}/col/${column}`).then((data) => mask(data, colDesc));
          } else {
            cols[column] = objs.then((objs) => objs.map((row) => row[column]));
          }
        }
        return cols[column];
      }
      if (cols[column] != null) { //already loading all
        return cols[column].then((d) => range.filter(d, (<any>desc).size));
      }
      //server side slicing
      return getAPIData(`/dataset/table/${desc.id}/col/${column}`, { range: range.toString() ).then((data) => maskCol(data, colDesc));
    },
    view: (desc: ITableDataDescription, name: string, args: IQueryArgs) => viaAPIViewLoader(name, args)
  };
}

function toFlat(data: any[][], vecs: ITableColumn[]) {
  return data.map((row) => vecs.map((col) => row[col.name]));
}

// TODO
function viaDataLoader(data: any[], nameProperty: any) {
  let _data: any = undefined;
  return (desc) => {
    if (_data) { //in the cache
      return Promise.resolve(_data);
    }
    const name: (any) => string = typeof(nameProperty) === 'function' ? nameProperty : (d) => d[nameProperty.toString()];

    function toGetter(col) {
      if (col.getter) {
        return col.getter;
      }
      return (d) => d[col.column || col.name];
    }

    const getters = desc.columns.map(toGetter);
    const objs = data.map((row) => {
      const r = {_: row};
      desc.columns.forEach((col, i) => {
        r[col.name] = getters[i](row);
      });
      return r;
    });
    const rows = data.map(name);
    _data = {
      rowIds: desc.rowassigner ? desc.rowassigner.map(rows) : range(0, data.length),
      rows: rows,
      objs: objs,
      data: getters.map((getter) => data.map(getter))
    };
    return Promise.resolve(_data);
  };
}

/**
 * root matrix implementation holding the data
 */
export class Table extends TableBase implements ITable {
  private vectors: TableVector[];

  constructor(public readonly desc: ITableDataDescription, private loader: ITableLoader2) {
    super(null);
    this._root = this;
    this.vectors = desc.columns.map((cdesc, i) => new TableVector(this, i, cdesc));
  }

  get idtype() {
    return idtypes_resolve(this.desc.idtype || (<any>this.desc).rowtype);
  }

  get idtypes() {
    return [this.idtype];
  }

  col(i: number) {
    return this.vectors[i];
  }

  cols(range: Range = all()) {
    return range.filter(this.vectors, [this.ncol]);
  }

  /**
   * access at a specific position
   * @param i
   * @param j
   * @returns {*}
   */
  at(i, j) {
    return this.colData(this.col(j).column, rlist(i)).then((arr) => arr[0]);
  }

  queryView(name: string, args: any) {
    return new Table(this.desc, adapterOne2Two(this.loader.view(this.desc, name, args)));
  }

  data(range: Range = all()) {
    return this.loader.data(this.desc, range);
  }

  colData(column: string, range: Range = all()) {
    return this.loader.col(this.desc, column, range);
  }

  objects(range: Range = all()) {
    return this.loader.objs(this.desc, range);
  }

  /**
   * return the row ids of the matrix
   * @returns {*}
   */
  rows(range: Range = all()): Promise<string[]> {
    return this.loader.rows(this.desc, range);
  }

  rowIds(range: Range = all()) {
    return this.loader.rowIds(this.desc, range);
  }

  ids(range: Range = all()) {
    return this.rowIds(range);
  }

  size() {
    return this.desc.size;
  }

  persist() {
    return this.desc.id;
  }

  restore(persisted: any): IPersistable {
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
class TableView extends TableBase implements ITable {
  constructor(root: ITable, private range: Range) {
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
    let r: ITable = this;
    if (persisted && persisted.range) { //some view onto it
      r = r.view(parse(persisted.range));
    }
    return r;
  }

  size() {
    return this.range.size(this._root.dim);
  }

  at(i: number, j: number) {
    let inverted = this.range.invert([i, j], this._root.dim);
    return this._root.at(inverted[0], inverted[1]);
  }

  col(i: number) {
    let inverted = this.range.invert([0, i], this._root.dim);
    return this._root.col(inverted[1]);
  }

  cols(range: Range = all()) {
    return this._root.cols(this.range.swap().preMultiply(range, this._root.dim));
  }

  data(range: Range = all()) {
    return this._root.data(this.range.preMultiply(range, this._root.dim));
  }

  objects(range: Range = all()) {
    return this._root.objects(this.range.preMultiply(range, this._root.dim));
  }

  rows(range: Range = all()) {
    return this._root.rows(this.range.preMultiply(range, this._root.dim));
  }

  rowIds(range: Range = all()) {
    return this._root.rowIds(this.range.preMultiply(range, this._root.dim));
  }

  ids(range: Range = all()) {
    return this.rowIds(range);
  }

  view(range: Range = all()) {
    if (range.isAll) {
      return this;
    }
    return new TableView(this._root, this.range.preMultiply(range, this.dim));
  }

  get idtype() {
    return this._root.idtype;
  }

  get idtypes() {
    return [this.idtype];
  }
}

/**
 * root matrix implementation holding the data
 */
export class TableVector extends VectorBase implements IVector {

  constructor(private table: Table, private index: number, public readonly desc: ITableDataDescription & ITableColumn) {
    super(null);
    this._root = this;
    // set default values
    const d = <any>desc;
    d.fqname = table.desc.fqname + '/' + this.desc.name;
    d.type = 'vector';
  }

  get valuetype() {
    return this.desc.value;
  }

  get column(): string {
    return this.desc.name;
  }

  get idtype() {
    return this.table.idtype;
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
    let r: IVector = this;
    if (persisted && persisted.range) { //some view onto it
      r = r.view(parse(persisted.range));
    }
    return r;
  }

  /**
   * access at a specific position
   * @param i
   * @returns {*}
   */
  at(i) {
    return this.table.at(i, this.index);
  }

  data(range: Range = all()) {
    return this.table.colData(this.column, range);
  }

  names(range: Range = all()) {
    return this.table.rows(range);
  }

  ids(range: Range = all()) {
    return this.table.rowIds(range);
  }

  size() {
    return this.table.nrow;
  }

  sort(compareFn?: (a: IValueType, b: IValueType) => number, thisArg?: any): Promise<IVector> {
    return this.data().then((d) => {
      let indices = argSort(d, compareFn, thisArg);
      return this.view(rlist(indices));
    });
  }

  map<U>(callbackfn: (value: IValueType, index: number) => U, thisArg?: any): Promise<IVector> {
    //FIXME
    return null;
  }

  filter(callbackfn: (value: IValueType, index: number) => boolean, thisArg?: any): Promise<IVector> {
    return this.data().then((d) => {
      let indices = argFilter(d, callbackfn, thisArg);
      return this.view(rlist(indices));
    });
  }
}


/**
 * a simple projection of a matrix columns to a vector
 */
class MultITableVector extends VectorBase implements IVector {
  readonly desc: ITableDataDescription;

  constructor(private table: ITable, private f: (row: any[]) => any, private this_f = table, public readonly valuetype : IValueTypeDesc = null, private _idtype = table.idtype) {
    super(null);
    this.desc = {
      name: table.desc.name + '-p',
      fqname: table.desc.fqname + '-p',
      type: 'vector',
      id: table.desc.id + '-p',
      idtype: _idtype.id,
      value: valuetype
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
      idtype: this.idtype === this.table.rowtype ? undefined : this.idtype.name
    };
  }

  restore(persisted: any) {
    let r: IVector = this;
    if (persisted && persisted.range) { //some view onto it
      r = r.view(parse(persisted.range));
    }
    return r;
  }

  size() {
    return this.table.nrow;
  }

  /**
   * return the associated ids of this vector
   */
  names(range?: Range): Promise<string[]> {
    return this.table.rows(range);
  }

  ids(range?: Range) {
    return this.table.rowIds(range);
  }

  /**
   * returns a promise for getting one cell
   * @param i
   */
  at(i: number): Promise<any> {
    return this.table.data(rlist(i)).then((d) => {
      return this.f.call(this.this_f, d[0]);
    });
  }

  /**
   * returns a promise for getting the data as two dimensional array
   * @param range
   */
  data(range?: Range): Promise<any[]> {
    return this.table.data(range).then((d) => {
      return d.map(this.f, this.this_f);
    });
  }

  sort(compareFn?: (a: any, b: any) => number, thisArg?: any): Promise<IVector> {
    return this.data().then((d) => {
      let indices = argSort(d, compareFn, thisArg);
      return this.view(rlist(indices));
    });
  }

  map<U>(callbackfn: (value: any, index: number) => U, thisArg?: any): Promise<IVector> {
    //FIXME
    return null;
  }

  filter(callbackfn: (value: any, index: number) => boolean, thisArg?: any): Promise<IVector> {
    return this.data().then((d) => {
      let indices = argFilter(d, callbackfn, thisArg);
      return this.view(rlist(indices));
    });
  }
}

/**
 * module entry point for creating a datatype
 * @param desc
 * @returns {ITable}
 */
export function create(desc: ITableDataDescription): ITable {
  if (typeof((<any>desc).loader) === 'function') {
    return new Table(desc, adapterOne2Two((<any>desc).loader));
  }
  return new Table(desc, viaAPI2Loader());
}

export function wrapObjects(desc: ITableDataDescription, data: any[], nameProperty: string|((obj: any) => string)) {
  return new Table(desc, adapterOne2Two(viaDataLoader(data, nameProperty)));
}

export class VectorTable extends TableBase implements ITable {
  readonly rowtype: IDType;
  readonly desc: ITableDataDescription;

  constructor(public desc: IDataDescription, private vectors: IVector[]) {
    super(null);
    this._root = this;
    const ref = vectors[0].desc;
    // generate the description extras
    const d = <any>desc;
    d.idtype = ref.idtype;
    d.size = [vectors[0].length, vectors.length];
    d.columns = vectors.map((v) => v.desc);
    tis.desc = d;
    this.rowtype = vectors[0].idtype;
  }

  get idtypes() {
    return [this.rowtype];
  }

  col(i: number) {
    return this.vectors[i];
  }

  cols(range: Range = all()) {
    return range.filter(this.vectors, [this.ncol]);
  }

  at(i, j) {
    return this.col(i).at(j);
  }

  data(range: Range = all()) {
    return Promise.all(this.vectors.map((v) => v.data(range))).then((arr: any[][]) => {
      const r = arr[0].map((i) => ([i]));
      arr.slice(1).forEach((ai) => ai.forEach((d, i) => r[i].push(d)));
      return r;
    });
  }

  objects(range: Range = all()) {
    return Promise.all(this.vectors.map((v) => v.data(range))).then((arr: any[][]) => {
      const names = this.vectors.map((d) => d.desc.name);
      const r = arr[0].map((i) => ( {[ names[0]]: i}));
      arr.slice(1).forEach((ai, j) => {
        const name = names[j + 1];
        ai.forEach((d, i) => r[i][name] = d);
      });
      return r;
    });
  }

  /**
   * return the row ids of the matrix
   * @returns {*}
   */
  rows(range: Range = all()): Promise<string[]> {
    return this.col(0).names(range);
  }

  rowIds(range: Range = all()) {
    return this.col(0).ids(range);
  }

  ids(range: Range = all()) {
    return this.rowIds(range);
  }

  size() {
    return [this.col(0).length, this.vectors.length];
  }

  persist() {
    return this.desc.id;
  }

  restore(persisted: any): IPersistable {
    if (persisted && typeof persisted.col === 'number') {
      return this.col(persisted.col);
    }
    return super.restore(persisted);
  }
}

export function fromVectors(desc: IDataDescription, vecs: IVector[]) {
  return new VectorTable(desc, vecs);
}
