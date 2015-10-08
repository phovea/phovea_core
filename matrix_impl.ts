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
import math = require('./math');
import matrix = require('./matrix');

function flatten(arr : any[][], indices: ranges.Range, select: number = 0) {
  var r = [], dim = [arr.length, arr[0].length];
  if (select === 0) {
    r = r.concat.apply(r, arr);
  } else {
    //stupid slicing
    for(var i = 0; i < dim[1]; ++i) {
      arr.forEach((ai) => {
        r.push(ai[i]);
      });
    }
  }
  return {
    data : r,
    indices: indices.dim(select).repeat(dim[1-select])
  };
}


/**
 * base class for different Matrix implementations, views, transposed,...
 */
export class MatrixBase extends idtypes.SelectAble {
  constructor(public _root:matrix.IMatrix) {
    super();
  }

  size():number[] {
    throw new Error('not implemented');
  }

  get dim() {
    return this.size();
  }

  get length() {
    return this.nrow * this.ncol;
  }

  get nrow() {
    return this.dim[0];
  }

  get ncol() {
    return this.dim[1];
  }

  get indices() : ranges.Range {
    return ranges.range([0, this.nrow], [0, this.ncol]);
  }

  data() : Promise<any[]> {
    throw new Error('not implemented');
  }

  view(): matrix.IMatrix;
  view(range:ranges.Range) : matrix.IMatrix;
  //view(filter: string): Promise<matrix.IMatrix>;
  view(): any {
    if (typeof arguments[0] === 'string') {
      return this.dynview(<string>arguments[0]);
    }
    var range : ranges.Range = arguments.length === 0 ? ranges.all() : arguments[0];
    if (range.isAll) {
      return this._root;
    }
    return new MatrixView(this._root, range);
  }

  dynview(filter: string): Promise<matrix.IMatrix> {
    return null;
  }

  slice(col: number) : vector.IVector {
    return new SliceColVector((<matrix.IMatrix><any>this), col);
  }

  stats() : Promise<math.IStatistics> {
    return this.data().then((d) => math.computeStats.apply(math,d));
  }

  hist(bins? : number, range:ranges.Range = ranges.all(), containedIds = 0) : Promise<math.IHistogram> {
    var v = this._root.valuetype;
    return this.data().then((d) => {
      var flat = flatten(d, this.indices, containedIds);
      switch(v.type) {
        case 'categorical':
          return math.categoricalHist(flat.data, flat.indices, flat.data.length, v.categories.map((d) => typeof d === 'string' ? d : d.name),
          v.categories.map((d) => typeof d === 'string' ? d : d.name || d.label),
          v.categories.map((d) => typeof d === 'string' ? 'gray' : d.color || 'gray'));
        case 'real':
        case 'int':
          return math.hist(flat.data, flat.indices, flat.data.length, bins ? bins : Math.round(Math.sqrt(this.length)), v.range);
        default:
          return null; //cant create hist for unique objects or other ones
      }
    });
  }

  idView(idRange:ranges.Range = ranges.all()) : Promise<matrix.IMatrix> {
    if (idRange.isAll) {
      return Promise.resolve(this._root);
    }
    return this.ids().then((ids) => this.view(ids.indexOf(idRange)));
  }

  reduce(f : (row : any[]) => any, this_f? : any, valuetype? : any, idtype? : idtypes.IDType) : vector.IVector {
    return new ProjectedVector(<matrix.IMatrix>(<any>this), f, this_f, valuetype, idtype);
  }

  restore(persisted: any) : C.IPersistable {
    if (persisted && persisted.f) {
      /* tslint:disable:no-eval */
      return this.reduce(eval(persisted.f), this, persisted.valuetype, persisted.idtype ? idtypes.resolve(persisted.idtype) : undefined);
      /* tslint:enable:no-eval */
    } else if (persisted && persisted.range) { //some view onto it
      return this.view(ranges.parse(persisted.range));
    } else if (persisted && persisted.transposed) {
      return (<matrix.IMatrix>(<any>this)).t;
    } else if (persisted && persisted.col) {
      return this.slice(+persisted.col);
    } else if (persisted && persisted.row) {
      return (<matrix.IMatrix>(<any>this)).t.slice(+persisted.row);
    } else {
      return <C.IPersistable>(<any>this);
    }
  }
}

export interface IMatrixLoader {
  (desc: datatypes.IDataDescription) : Promise<{
    rowIds : ranges.Range;
    rows : string[];
    colIds : ranges.Range;
    cols : string[];
    ids: ranges.Range;
    data : any[][];
  }>;
}

export interface IMatrixLoader2 {
  rowIds(desc: datatypes.IDataDescription, range: ranges.Range) : Promise<ranges.Range>;
  rows(desc: datatypes.IDataDescription, range: ranges.Range) : Promise<string[]>;
  colIds(desc: datatypes.IDataDescription, range: ranges.Range) : Promise<ranges.Range>;
  cols(desc: datatypes.IDataDescription, range: ranges.Range) : Promise<string[]>;
  ids(desc: datatypes.IDataDescription, range: ranges.Range) : Promise<ranges.Range>;
  at(desc: datatypes.IDataDescription, i, j) : Promise<any>;
  hist?(desc: datatypes.IDataDescription, range: ranges.Range, bins?: number): Promise<math.IHistogram>;
  data(desc: datatypes.IDataDescription, range: ranges.Range) : Promise<any[][]>;
  heatmapUrl?(desc: datatypes.IDataDescription, range:ranges.Range, options: { format?: string; transpose?: boolean; range?: [number,number]}): string;
}

function adapterOne2Two(loader: IMatrixLoader): IMatrixLoader2 {
  return {
    rowIds: (desc: datatypes.IDataDescription, range: ranges.Range) => loader(desc).then((d) => range.preMultiply(d.rowIds, (<any>desc).size)),
    rows: (desc: datatypes.IDataDescription, range: ranges.Range) => loader(desc).then((d) => range.dim(0).filter(d.rows, (<any>desc).size[0])),
    colIds: (desc: datatypes.IDataDescription, range: ranges.Range) => loader(desc).then((d) => range.preMultiply(d.colIds, (<any>desc).size)),
    cols: (desc: datatypes.IDataDescription, range: ranges.Range) => loader(desc).then((d) => range.dim(1).filter(d.cols, (<any>desc).size[1])),
    ids: (desc: datatypes.IDataDescription, range:ranges.Range) => loader(desc).then((data) => range.preMultiply(data.ids, (<any>desc).size)),
    at: (desc: datatypes.IDataDescription, i, j) => loader(desc).then((data) => data[i][j]),
    data: (desc: datatypes.IDataDescription ,range: ranges.Range) => loader(desc).then((d) => range.filter(d.data, (<any>desc).size))
  };
}

function maskIt(desc: datatypes.IDataDescription) {
  return (v) => datatypes.mask(v, desc);
}

function viaAPI2Loader() {
  var rowIds = null,
    rows = null,
    colIds = null,
    cols = null,
    data = null,
    hist = null;
  var r = {
    rowIds: (desc:datatypes.IDataDescription, range:ranges.Range) => {
      if (rowIds == null) {
        rowIds = ajax.getAPIJSON('/dataset/matrix/'+desc.id+'/rowIds').then((ids) => {
          return ranges.parse(ids);
        });
      }
      return rowIds.then((d) => {
        return range.preMultiply(d, (<any>desc).size);
      });
    },
    rows: (desc:datatypes.IDataDescription, range:ranges.Range) => {
      if (rows == null) {
        rows = ajax.getAPIJSON('/dataset/matrix/' + desc.id + '/rows');
      }
      return rows.then((d) => range.dim(0).filter(d, (<any>desc).size[0]));
    },
    colIds: (desc:datatypes.IDataDescription, range:ranges.Range) => {
      if (colIds == null) {
        colIds = ajax.getAPIJSON('/dataset/matrix/' + desc.id + '/colIds').then((ids) => ranges.parse(ids));
      }
      return colIds.then((d) => range.preMultiply(d, (<any>desc).size));
    },
    cols: (desc:datatypes.IDataDescription, range:ranges.Range) => {
      if (cols == null) {
        cols = ajax.getAPIJSON('/dataset/matrix/' + desc.id + '/cols');
      }
      return cols.then((d) => range.dim(1).filter(d, (<any>desc).size[1]));
    },
    ids: (desc:datatypes.IDataDescription, range:ranges.Range) => {
      range.dim(0); //ensure two dim
      range.dim(1); //ensure two dim
      var split = range.split();
      return Promise.all([r.rowIds(desc, split[0] || ranges.all()), r.colIds(desc, split[1] || ranges.all())]).then((idsA: ranges.Range[]) => {
        return ranges.join(idsA);
      });
    },
    hist: (desc:datatypes.IDataDescription, range: ranges.Range, bins: number = NaN) => {
      if (range.isAll && isNaN(bins)) {
        if (hist == null) {
          hist = ajax.getAPIJSON('/dataset/matrix/' + desc.id + '/hist').then((hist:number[]) => math.wrapHist(hist, (<any>desc).value.range));
        }
        return hist;
      }
      const args : any= {
        range: range.toString()
      };
      if (!isNaN(bins)) {
        args.bins = bins;
      }
      return ajax.getAPIJSON('/dataset/matrix/'+desc.id+'/hist', args).then((hist: number[]) => {
        return math.wrapHist(hist, (<any>desc).value.range);
      });
    },
    at: (desc:datatypes.IDataDescription, i, j) => r.data(desc, ranges.list([i],[j])).then((data) => datatypes.mask(data[0][0], desc)),
    data: (desc:datatypes.IDataDescription, range:ranges.Range) => {
      if (range.isAll) {
        if (data == null) {
          data = ajax.getAPIJSON('/dataset/matrix/' + desc.id + '/raw').then(maskIt(desc));
        }
        return data;
      }
      if (data != null) { //already loading all
        return data.then((d) => range.filter(d, (<any>desc).size));
      }
      //server side slicing
      return ajax.getAPIData('/dataset/matrix/'+desc.id+'/raw', {
        range: range.toString()
      }).then(maskIt(desc));
    },
    heatmapUrl: (desc:datatypes.IDataDescription, range:ranges.Range, options: { format?: string; transpose?: boolean; range?: [number,number]}) => {
      var args : any = {
        format: options.format || 'png'
      };
      if (options.transpose === true) {
        args.format_transpose = true;
      }
      if (options.range) {
        args.format_min = options.range[0];
        args.format_max = options.range[1];
      }
      return ajax.api2absURL(`/dataset/matrix/${desc.id}/data`, args);
    }
  };
  return r;
}

/**
 * root matrix implementation holding the data
 */
export class Matrix extends MatrixBase implements matrix.IMatrix {
  t:matrix.IMatrix;
  valuetype:any;
  rowtype:idtypes.IDType;
  coltype:idtypes.IDType;

  constructor(public desc: datatypes.IDataDescription, private loader: IMatrixLoader2) {
    super(null);
    this._root = this;
    var d = <any>desc;
    this.valuetype = d.value;
    this.rowtype = idtypes.resolve(d.rowtype);
    this.coltype = idtypes.resolve(d.coltype);
    this.t = new TransposedMatrix(this);
  }

  get idtypes() {
    return [this.rowtype, this.coltype];
  }

  /**
   * access at a specific position
   * @param i
   * @param j
   * @returns {*}
   */
  at(i, j) {
    return this.loader.at(this.desc, i, j);
  }

  data(range: ranges.Range = ranges.all()) {
    return this.loader.data(this.desc, range);
  }
  ids(range:ranges.Range = ranges.all()) {
    return this.loader.ids(this.desc, range);
  }


  /**
   * return the column ids of the matrix
   * @returns {*}
   */
  cols(range: ranges.Range= ranges.all()) : Promise<string[]> {
    return this.loader.cols(this.desc, range);
  }
  colIds(range:ranges.Range = ranges.all()) {
    return this.loader.colIds(this.desc, range);
  }

  /**
   * return the row ids of the matrix
   * @returns {*}
   */
  rows(range: ranges.Range = ranges.all()) : Promise<string[]> {
    return this.loader.rows(this.desc, range);
  }
  rowIds(range:ranges.Range = ranges.all()) {
    return this.loader.rowIds(this.desc, range);
  }

  hist(bins? : number, range:ranges.Range = ranges.all(), containedIds = 0) : Promise<math.IHistogram> {
    if (this.loader.hist) {
      return this.loader.hist(this.desc, range, bins);
    }
    super.hist(bins, range, containedIds);
  }

  size() {
    return (<any>this.desc).size;
  }

  persist() {
    return this.desc.id;
  }

  heatmapUrl(range = ranges.all(), options : any = {}) {
    if (this.loader.heatmapUrl) {
      return this.loader.heatmapUrl(this.desc, range, options);
    }
    return null;
  }
}

/**
 * view on the underlying matrix as transposed version
 * @param base
 * @constructor
 */
class TransposedMatrix extends MatrixBase  implements matrix.IMatrix {
  t:matrix.IMatrix;

  constructor(base:Matrix) {
    super(base);
    this.t = base;
  }

  get desc() {
    return this._root.desc;
  }

  persist() {
    return {
      root: this._root.persist(),
      transposed: true
    };
  }

  get valuetype() {
    return this._root.valuetype;
  }

  get rowtype() {
    return this._root.coltype;
  }

  get coltype() {
    return this._root.rowtype;
  }

  get idtypes() {
    return [this.rowtype, this.coltype];
  }

  ids(range:ranges.Range = ranges.all()) {
    return this.t.ids(range ? range.swap() : undefined).then((ids) => ids.swap());
  }

  cols(range:ranges.Range = ranges.all()): Promise<string[]> {
    return this.t.rows(range ? range.swap() : undefined);
  }
  colIds(range:ranges.Range = ranges.all()) {
    return this.t.rowIds(range ? range.swap() : undefined);
  }

  rows(range:ranges.Range = ranges.all()): Promise<string[]> {
    return this.t.cols(range ? range.swap() : undefined);
  }
  rowIds(range:ranges.Range = ranges.all()) {
    return this.t.colIds(range ? range.swap() : undefined);
  }

  view(range:ranges.Range = ranges.all()) : matrix.IMatrix {
    if (range.isAll) {
      return this;
    }
    return new MatrixView(this._root, range.swap()).t;
  }
  slice(col: number): vector.IVector {
    return new SliceRowVector(this._root, col);
  }

  size() {
    var s = this.t.dim;
    return [s[1], s[0]]; //swap dimension
  }

  at(i:number, j:number) {
    return this.t.at(j, i);
  }

  data(range:ranges.Range = ranges.all()) {
    return this.t.data(range ? range.swap() : undefined).then((data : any[][]) => datatypes.transpose(data));
  }

  hist(bins? : number, range: ranges.Range = ranges.all(), containedIds = 0) : Promise<math.IHistogram> {
    return this.t.hist(bins, range ? range.swap() : undefined, 1-containedIds);
  }

  heatmapUrl(range = ranges.all(), options : any = {}) {
    options.transpose = options.transpose !== true;
    return this.t.heatmapUrl(range ? range.swap() : undefined, options);
  }
}

/**
 * view on the matrix restricted by a range
 * @param root underlying matrix
 * @param range range selection
 * @param t optional its transposed version
 * @constructor
 */
class MatrixView extends MatrixBase implements matrix.IMatrix {
  constructor(root:matrix.IMatrix, private range:ranges.Range, public t? : matrix.IMatrix) {
    super(root);
    this.range = range;
    //ensure that there are two dimensions
    range.dim(0);
    range.dim(1);
    if (!t) {
      this.t = new MatrixView(root.t, range.swap(), this);
    }
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

  ids(range: ranges.Range = ranges.all()) {
    return this._root.ids(this.range.preMultiply(range, this._root.dim));
  }

  cols(range: ranges.Range = ranges.all()) {
    return this._root.cols(this.range.preMultiply(range, this._root.dim));
  }
  colIds(range: ranges.Range = ranges.all()) {
    return this._root.colIds(this.range.preMultiply(range, this._root.dim));
  }

  rows(range: ranges.Range = ranges.all()) {
    return this._root.rows(this.range.preMultiply(range, this._root.dim));
  }
  rowIds(range: ranges.Range = ranges.all()) {
    return this._root.rowIds(this.range.preMultiply(range, this._root.dim));
  }

  size() {
    return this.range.size(this._root.dim);
  }

  at(i: number, j : number) {
    var inverted = this.range.invert([i, j], this._root.dim);
    return this._root.at(inverted[0], inverted[1]);
  }

  data(range: ranges.Range = ranges.all()) {
    return this._root.data(this.range.preMultiply(range, this._root.dim));
  }

  hist(bins? : number, range: ranges.Range = ranges.all(), containedIds = 0) : Promise<math.IHistogram> {
    return this._root.hist(bins, this.range.preMultiply(range, this._root.dim), containedIds);
  }

  heatmapUrl(range = ranges.all(), options : any = {}) {
    return this._root.heatmapUrl(this.range.preMultiply(range, this._root.dim), options);
  }

  view(range: ranges.Range = ranges.all()) {
    if (range.isAll) {
      return this;
    }
    return new MatrixView(this._root, this.range.preMultiply(range, this.dim));
  }

  get valuetype() {
    return this._root.valuetype;
  }

  get rowtype() {
    return this._root.rowtype;
  }

  get coltype() {
    return this._root.coltype;
  }

  get idtypes() {
    return [this.rowtype, this.coltype];
  }
}


/**
 * a simple projection of a matrix columns to a vector
 */
class SliceColVector extends vector_impl.VectorBase implements vector.IVector {
  desc : datatypes.IDataDescription;
  private colRange: ranges.Range1D;
  constructor(private m : matrix.IMatrix, private col: number) {
    super(null);
    this.colRange = ranges.Range1D.from([this.col]);
    this.desc = {
      name : m.desc.name+'-c'+col,
      fqname : m.desc.fqname+'-c'+col,
      id : m.desc.id+'-c'+col,
      type : 'vector',
      size: this.dim,
      value: this.valuetype
    };
    this._root = this;
  }

  persist() {
    return {
      root: this.m.persist(),
      col: this.col
    };
  }

  restore(persisted: any) {
    var r : vector.IVector = this;
    if (persisted && persisted.range) { //some view onto it
      r = r.view(ranges.parse(persisted.range));
    }
    return r;
  }

  get valuetype() {
    return this.m.valuetype;
  }

  get idtype() {
    return this.m.rowtype;
  }

  get idtypes() {
    return [this.idtype];
  }

  size() {
    return this.m.nrow;
  }
  /**
   * return the associated ids of this vector
   */
  names(range?:ranges.Range) : Promise<string[]> {
    return this.m.rows(range);
  }
  ids(range?:ranges.Range) {
    return this.m.rowIds(range);
  }

  /**
   * returns a promise for getting one cell
   * @param i
   */
  at(i:number) : Promise<any> {
    return this.m.at(i, this.col);
  }
  /**
   * returns a promise for getting the data as two dimensional array
   * @param range
   */
  data(range:ranges.Range = ranges.all()) : Promise<any[]> {
    const r = ranges.list(range.dim(0),this.colRange);
    return this.m.data(r).then((d)=> {
      if (d.length > 0 && Array.isArray(d[0])) {
        return d.map((di) => di[0]);
      }
      return d;
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
 * a simple projection of a matrix columns to a vector
 */
class SliceRowVector extends vector_impl.VectorBase implements vector.IVector {
  desc : datatypes.IDataDescription;
  private rowRange: ranges.Range1D;
  constructor(private m : matrix.IMatrix, private row: number) {
    super(null);
    this.rowRange = ranges.Range1D.from([this.row]);
    this.desc = {
      name : m.desc.name+'-r'+row,
      fqname : m.desc.fqname+'-r'+row,
      id : m.desc.id+'-r'+row,
      type : 'vector',
      size: this.dim,
      value: this.valuetype
    };
    this._root = this;
  }

  persist() {
    return {
      root: this.m.persist(),
      row: this.row
    };
  }

  restore(persisted: any) {
    var r : vector.IVector = this;
    if (persisted && persisted.range) { //some view onto it
      r = r.view(ranges.parse(persisted.range));
    }
    return r;
  }

  get valuetype() {
    return this.m.valuetype;
  }

  get idtype() {
    return this.m.coltype;
  }

  get idtypes() {
    return [this.idtype];
  }

  size() {
    return this.m.ncol;
  }
  /**
   * return the associated ids of this vector
   */
  names(range?:ranges.Range) : Promise<string[]> {
    return this.m.cols(range);
  }
  ids(range?:ranges.Range) {
    return this.m.colIds(range);
  }

  /**
   * returns a promise for getting one cell
   * @param i
   */
  at(i:number) : Promise<any> {
    return this.m.at(this.row, i);
  }
  /**
   * returns a promise for getting the data as two dimensional array
   * @param range
   */
  data(range:ranges.Range = ranges.all()) : Promise<any[]> {
    const r = ranges.list(this.rowRange,range.dim(0));
    return this.m.data(r).then((d)=> {
      return d[0];
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
 * a simple projection of a matrix columns to a vector
 */
class ProjectedVector extends vector_impl.VectorBase implements vector.IVector {
  desc : datatypes.IDataDescription;

  constructor(private m : matrix.IMatrix, private f : (row : any[]) => any, private this_f = m, public valuetype = m.valuetype, private _idtype = m.rowtype) {
    super(null);
    this.desc = {
      name : m.desc.name+'-p',
      fqname : m.desc.fqname+'-p',
      type : 'vector',
      id : m.desc.id+'-p',
      size: this.dim,
      value: this.valuetype
    };
    this._root = this;
  }

  persist() {
    return {
      root: this.m.persist(),
      f: this.f.toString(),
      valuetype: this.valuetype === this.m.valuetype ? undefined : this.valuetype,
      idtype: this.idtype === this.m.rowtype ? undefined: this.idtype.name
    };
  }

  restore(persisted: any) {
    var r : vector.IVector = this;
    if (persisted && persisted.range) { //some view onto it
      r = r.view(ranges.parse(persisted.range));
    }
    return r;
  }

  get idtype() {
    return this._idtype;
  }

  get idtypes() {
    return [this._idtype];
  }

  size() {
    return this.m.nrow;
  }
  /**
   * return the associated ids of this vector
   */
  names(range?:ranges.Range) : Promise<string[]> {
    return this.m.rows(range);
  }
  ids(range?:ranges.Range) {
    return this.m.rowIds(range);
  }

  /**
   * returns a promise for getting one cell
   * @param i
   * @param j
   */
  at(i:number) : Promise<any> {
    return this.m.data(ranges.list(i)).then((d)=> {
      return this.f.call(this.this_f, d[0]);
    });
  }
  /**
   * returns a promise for getting the data as two dimensional array
   * @param range
   */
  data(range?:ranges.Range) : Promise<any[]> {
    return this.m.data(range).then((d)=> {
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
 * @returns {IMatrix}
 */
export function create(desc: datatypes.IDataDescription): matrix.IMatrix {
  if (C.isFunction((<any>desc).loader)) {
    return new Matrix(desc, adapterOne2Two((<any>desc).loader));
  }
  return new Matrix(desc, viaAPI2Loader());
}
