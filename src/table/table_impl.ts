/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */

import {IPersistable, argFilter, argSort, fixId, mixin} from '../index';
import {getAPIJSON, getAPIData} from '../ajax';
import {Range, all, list as rlist, parse, range, RangeLike} from '../range';
import {SelectAble, resolve as idtypes_resolve, IDType, createLocalAssigner} from '../idtype';
import {
  IDataDescription, mask, IValueType, IValueTypeDesc, INumberValueTypeDesc, VALUE_TYPE_INT,
  VALUE_TYPE_REAL, guessValueTypeDesc, createDefaultDataDesc
} from '../datatype';
import {IVector, IVectorDataDescription} from '../vector';
import AVector from '../vector/AVector';
import {ITable, IQueryArgs, ITableColumn, ITableDataDescription} from './ITable';
/**
 * base class for different Table implementations, views, transposed,...
 */
export abstract class ATable extends SelectAble {
  constructor(protected root: ITable) {
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

  view(range: RangeLike = all()): ITable {
    return new TableView(this.root, parse(range));
  }

  abstract queryView(name: string, args: IQueryArgs): ITable;

  idView(idRange: RangeLike = all()): Promise<ITable> {
    return this.ids().then((ids) => this.view(ids.indexOf(parse(idRange))));
  }

  reduce(f: (row: any[]) => any, this_f?: any, valuetype?: any, idtype?: IDType): IVector {
    return new MultITableVector(this.root, f, this_f, valuetype, idtype);
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


function viaAPIViewLoader(name: string, args: IQueryArgs): ITableLoader {
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

function maskCol(arr: IValueType[], col: ITableColumn): IValueType[] {
  //mask data
  if (col.value && 'missing' in col.value && (col.value.type === VALUE_TYPE_INT || col.value.type === VALUE_TYPE_REAL)) {
    return <IValueType[]>mask(arr, <INumberValueTypeDesc>col.value);
  }
  return arr;
}

function maskObjects(arr: IValueType[], desc: ITableDataDescription) {
  //mask data
  const maskAble = desc.columns.filter((col) => col.value && 'missing' in col.value && (col.value.type === VALUE_TYPE_INT || col.value.type === VALUE_TYPE_REAL));
  if (maskAble.length > 0) {
    arr.forEach((row) => {
      maskAble.forEach((col) => row[col.name] = mask(row[col.name], <INumberValueTypeDesc>col.value));
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
  const r: ITableLoader2 = {
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
      return getAPIData(`/dataset/table/${desc.id}/raw`, {range: range.toString()}).then((data) => maskObjects(data, desc));
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
      return getAPIData(`/dataset/table/${desc.id}/col/${column}`, {range: range.toString()}).then((data) => maskCol(data, colDesc));
    },
    view: (desc: ITableDataDescription, name: string, args: IQueryArgs) => viaAPIViewLoader(name, args)
  };
  return r;
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
export class Table extends ATable implements ITable {
  private vectors: TableVector[];

  constructor(public readonly desc: ITableDataDescription, private loader: ITableLoader2) {
    super(null);
    this.root = this;
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

  cols(range: RangeLike = all()) {
    return parse(range).filter(this.vectors, [this.ncol]);
  }

  /**
   * access at a specific position
   * @param i
   * @param j
   * @returns {*}
   */
  at(i: number, j: number) {
    return this.colData(this.col(j).column, rlist(i)).then((arr) => arr[0]);
  }

  queryView(name: string, args: any) {
    return new Table(this.desc, adapterOne2Two(this.loader.view(this.desc, name, args)));
  }

  data(range: RangeLike = all()) {
    return this.loader.data(this.desc, parse(range));
  }

  colData(column: string, range: RangeLike = all()) {
    return this.loader.col(this.desc, column, parse(range));
  }

  objects(range: RangeLike = all()) {
    return this.loader.objs(this.desc, parse(range));
  }

  /**
   * return the row ids of the matrix
   * @returns {*}
   */
  rows(range: RangeLike = all()): Promise<string[]> {
    return this.loader.rows(this.desc, parse(range));
  }

  rowIds(range: RangeLike = all()) {
    return this.loader.rowIds(this.desc, parse(range));
  }

  ids(range: RangeLike = all()) {
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
class TableView extends ATable implements ITable {
  constructor(root: ITable, private range: Range) {
    super(root);
    this.range = range;
  }

  get desc() {
    return this.root.desc;
  }

  persist() {
    return {
      root: this.root.persist(),
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
    return this.range.size(this.root.dim);
  }

  at(i: number, j: number) {
    let inverted = this.range.invert([i, j], this.root.dim);
    return this.root.at(inverted[0], inverted[1]);
  }

  col(i: number) {
    let inverted = this.range.invert([0, i], this.root.dim);
    return this.root.col(inverted[1]);
  }

  cols(range: RangeLike = all()) {
    return this.root.cols(this.range.swap().preMultiply(parse(range), this.root.dim));
  }

  data(range: RangeLike = all()) {
    return this.root.data(this.range.preMultiply(parse(range), this.root.dim));
  }

  objects(range: RangeLike = all()) {
    return this.root.objects(this.range.preMultiply(parse(range), this.root.dim));
  }

  rows(range: RangeLike = all()) {
    return this.root.rows(this.range.preMultiply(parse(range), this.root.dim));
  }

  rowIds(range: RangeLike = all()) {
    return this.root.rowIds(this.range.preMultiply(parse(range), this.root.dim));
  }

  ids(range: RangeLike = all()) {
    return this.rowIds(range);
  }

  view(range: RangeLike = all()) {
    const r = parse(range);
    if (r.isAll) {
      return this;
    }
    return new TableView(this.root, this.range.preMultiply(r, this.dim));
  }

  get idtype() {
    return this.root.idtype;
  }

  get idtypes() {
    return [this.idtype];
  }

  queryView(name: string, args: any): ITable {
    throw new Error('not implemented');
  }
}

/**
 * root matrix implementation holding the data
 */
export class TableVector extends AVector implements IVector {
  readonly desc: IVectorDataDescription;
  readonly column: string;

  constructor(private table: Table, private index: number, desc: ITableColumn) {
    super(null);
    this.column = desc.name;
    this.root = this;
    this.desc = {
      type: 'vector',
      id: table.desc.id + '_' + desc.name,
      name: desc.name,
      description: desc.description || '',
      fqname: table.desc.fqname + '/' + desc.name,
      idtype: table.idtype.id,
      size: table.nrow,
      value: desc.value,
      creator: table.desc.creator,
      ts: table.desc.ts
    };
  }

  get valuetype() {
    return this.desc.value;
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
  at(i: number) {
    return this.table.at(i, this.index);
  }

  data(range: RangeLike = all()) {
    return this.table.colData(this.column, range);
  }

  names(range: RangeLike = all()) {
    return this.table.rows(range);
  }

  ids(range: RangeLike = all()) {
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
class MultITableVector extends AVector implements IVector {
  readonly desc: IVectorDataDescription;

  constructor(private table: ITable, private f: (row: any[]) => any, private this_f = table, public readonly valuetype: IValueTypeDesc = null, private _idtype = table.idtype) {
    super(null);
    this.desc = {
      name: table.desc.name + '-p',
      fqname: table.desc.fqname + '-p',
      description: f.toString(),
      type: 'vector',
      id: fixId(table.desc.id + '-p' + f.toString()),
      idtype: table.desc.idtype,
      size: table.nrow,
      value: valuetype,
      creator: table.desc.creator,
      ts: Date.now()
    };
    this.root = this;
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
      idtype: this.idtype === this.table.idtype ? undefined : this.idtype.name
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
  names(range?: RangeLike): Promise<string[]> {
    return this.table.rows(range);
  }

  ids(range?: RangeLike) {
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
  data(range?: RangeLike): Promise<any[]> {
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

  filter(callbackfn: (value: any, index: number) => boolean, thisArg?: any): Promise<IVector> {
    return this.data().then((d) => {
      let indices = argFilter(d, callbackfn, thisArg);
      return this.view(rlist(indices));
    });
  }
}


export class VectorTable extends ATable implements ITable {
  readonly idtype: IDType;
  readonly desc: ITableDataDescription;

  constructor(desc: IDataDescription, private vectors: IVector[]) {
    super(null);
    this.root = this;
    const ref = vectors[0].desc;
    // generate the description extras
    const d = <any>desc;
    d.idtype = ref.idtype;
    d.size = [vectors[0].length, vectors.length];
    d.columns = vectors.map((v) => v.desc);
    this.desc = d;
    this.idtype = vectors[0].idtype;
  }

  get idtypes() {
    return [this.idtype];
  }

  col(i: number) {
    return this.vectors[i];
  }

  cols(range: RangeLike = all()) {
    return parse(range).filter(this.vectors, [this.ncol]);
  }

  at(i, j) {
    return this.col(i).at(j);
  }

  data(range: RangeLike = all()) {
    return Promise.all(this.vectors.map((v) => v.data(range))).then((arr: any[][]) => {
      const r = arr[0].map((i) => ([i]));
      arr.slice(1).forEach((ai) => ai.forEach((d, i) => r[i].push(d)));
      return r;
    });
  }

  objects(range: RangeLike = all()) {
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
  rows(range: RangeLike = all()): Promise<string[]> {
    return this.col(0).names(range);
  }

  rowIds(range: RangeLike = all()) {
    return this.col(0).ids(range);
  }

  ids(range: RangeLike = all()) {
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

  queryView(name: string, args: IQueryArgs): ITable {
    throw Error('not implemented');
  }
}


/**
 * module entry point for creating a datatype
 * @param desc
 * @returns {ITable}
 */
export function create(desc: ITableDataDescription, loader?: ITableLoader): ITable {
  if (loader) {
    return new Table(desc, adapterOne2Two(loader));
  }
  return new Table(desc, viaAPI2Loader());
}

export function wrapObjects(desc: ITableDataDescription, data: any[], nameProperty: string|((obj: any) => string)) {
  return new Table(desc, adapterOne2Two(viaDataLoader(data, nameProperty)));
}

export function fromVectors(desc: IDataDescription, vecs: IVector[]) {
  return new VectorTable(desc, vecs);
}


function toObjects(data: any[][], cols: string[]) {
  return data.map((row) => {
    const r: any = {};
    cols.forEach((col, i) => r[col] = row[i]);
    return r;
  });
}
function toList(objs: any[], cols: string[]) {
  return objs.map((obj) => cols.map((c) => obj[c]));
}

export interface IAsTableOptions {
  name?: string;
  idtype?: string;
  rowassigner?(ids: string[]): Range;
  keyProperty?: string;
}


function createDefaultTableDesc(): ITableDataDescription {
  return <ITableDataDescription>mixin(createDefaultDataDesc(), {
    idtype: '_rows',
    columns: [],
    size: [0, 0]
  });
}


function asTableImpl(columns: ITableColumn[], rows: string[], objs: any[], data: IValueType[][], options: IAsTableOptions = {}) {
  const desc = mixin(createDefaultTableDesc(), {
    columns: columns,
    size: [rows.length, columns.length]
  }, options);

  const rowAssigner = options.rowassigner || createLocalAssigner();
  const loader: ITableLoader = () => {
    const r = {
      rowIds: rowAssigner(rows),
      rows: rows,
      objs: objs,
      data: data
    };
    return Promise.resolve(r);
  };
  return new Table(desc, adapterOne2Two(loader));
}

export function asTableFromArray(data: any[][], options: IAsTableOptions = {}): ITable {
  const rows = data.map((r) => r[0]);
  const cols = data[0].slice(1);
  const tableData = data.slice(1).map((r) => r.slice(1));

  const columns = cols.map((col, i) => {
    return {
      name: col,
      value: guessValueTypeDesc(tableData.map((row) => row[i]))
    };
  });

  const realData = tableData.map((row) => columns.map((col, i) => (col.value.type === VALUE_TYPE_REAL || col.value.type === VALUE_TYPE_INT) ? parseFloat(row[i]) : row[i]));
  const objs = toObjects(realData, cols);

  return asTableImpl(columns, rows, objs, realData, options);
}

export function asTable(data: any[], options: IAsTableOptions = {}): ITable {
  const keyProperty = options.keyProperty || '_id';

  const rows = data.map((r, i) => String(r[keyProperty]) || String(i));
  const cols = Object.keys(data[0]);
  const objs = data;
  const realData = toList(objs, cols);

  const columns = cols.map((col, i) => {
    return {
      name: col,
      value: guessValueTypeDesc(realData.map((row) => row[i]))
    };
  });
  return asTableImpl(columns, rows, objs, realData, options);
}
