/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */

import {argSort, argFilter, IPersistable} from './index';
import {getAPIJSON, api2absURL, getAPIData} from './ajax';
import {list as rlist, Range, RangeLike, all, range, join, Range1D, parse} from './range';
import {IDType, AProductSelectAble, resolve as resolveIDType, resolveProduct, ProductIDType} from './idtype';
import {
  mask, transpose, VALUE_TYPE_CATEGORICAL, VALUE_TYPE_INT, VALUE_TYPE_REAL,
  ICategoricalValueTypeDesc, INumberValueTypeDesc, IValueTypeDesc, IValueType
} from './datatype';
import {IVector, IVectorDataDescription} from './vector';
import {AVector} from './vector_impl';
import {IStatistics, IHistogram, computeStats, hist, categoricalHist, wrapHist} from './math';
import {IMatrix, IMatrixDataDescription, IHeatMapUrlOptions} from './matrix';

function flatten<T>(arr: T[][], indices: Range, select: number = 0) {
  let r = [];
  const dim = [arr.length, arr[0].length];
  if (select === 0) {
    r = r.concat.apply(r, arr);
  } else {
    //stupid slicing
    for (let i = 0; i < dim[1]; ++i) {
      arr.forEach((ai) => {
        r.push(ai[i]);
      });
    }
  }
  return {
    data: r,
    indices: indices.dim(select).repeat(dim[1 - select])
  };
}


/**
 * base class for different Matrix implementations, views, transposed,...
 */
export abstract class AMatrix extends AProductSelectAble {
  constructor(protected root: IMatrix) {
    super();
  }

  abstract size(): number[];

  abstract data(range?: RangeLike): Promise<IValueType[][]>;

  abstract t: IMatrix;

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

  get indices(): Range {
    return range([0, this.nrow], [0, this.ncol]);
  }

  view(range: RangeLike = all()): IMatrix {
    const r = parse(range);
    if (r.isAll) {
      return this.root;
    }
    return new MatrixView(this.root, r);
  }

  slice(col: number): IVector {
    return new SliceColVector(this.root, col);
  }

  stats(): Promise<IStatistics> {
    return this.data().then((d) => computeStats(...d));
  }

  hist(bins?: number, range: RangeLike = all(), containedIds = 0): Promise<IHistogram> {
    const v = this.root.valuetype;
    return this.data(range).then((d) => {
      const flat = flatten(d, this.indices, containedIds);
      switch (v.type) {
        case VALUE_TYPE_CATEGORICAL:
          const vc = <ICategoricalValueTypeDesc>v;
          return categoricalHist(flat.data, flat.indices, flat.data.length, vc.categories.map((d) => typeof d === 'string' ? d : d.name),
            vc.categories.map((d) => typeof d === 'string' ? d : d.name || d.label),
            vc.categories.map((d) => typeof d === 'string' ? 'gray' : d.color || 'gray'));
        case VALUE_TYPE_INT:
        case VALUE_TYPE_REAL:
          const vn = <INumberValueTypeDesc>v;
          return hist(flat.data, flat.indices, flat.data.length, bins ? bins : Math.round(Math.sqrt(this.length)), vn.range);
        default:
          return Promise.reject<IHistogram>('invalid value type: ' + v.type); //cant create hist for unique objects or other ones
      }
    });
  }

  idView(idRange: RangeLike = all()): Promise<IMatrix> {
    const r = parse(idRange);
    if (r.isAll) {
      return Promise.resolve(this.root);
    }
    return this.ids().then((ids) => this.view(ids.indexOf(r)));
  }

  reduce(f: (row: any[]) => any, this_f?: any, valuetype?: any, idtype?: IDType): IVector {
    return new ProjectedVector(this.root, f, this_f, valuetype, idtype);
  }

  restore(persisted: any): IPersistable {
    if (persisted && persisted.f) {
      /* tslint:disable:no-eval */
      return this.reduce(eval(persisted.f), this, persisted.valuetype, persisted.idtype ? resolveIDType(persisted.idtype) : undefined);
      /* tslint:enable:no-eval */
    } else if (persisted && persisted.range) { //some view onto it
      return this.view(parse(persisted.range));
    } else if (persisted && persisted.transposed) {
      return (<IMatrix>(<any>this)).t;
    } else if (persisted && persisted.col) {
      return this.slice(+persisted.col);
    } else if (persisted && persisted.row) {
      return this.t.slice(+persisted.row);
    } else {
      return <IPersistable>(<any>this);
    }
  }

}

export interface IMatrixLoader {
  (desc: IMatrixDataDescription): Promise<{
    rowIds: Range;
    rows: string[];
    colIds: Range;
    cols: string[];
    ids: Range;
    data: any[][];
  }>;
}

export interface IMatrixLoader2 {
  rowIds(desc: IMatrixDataDescription, range: Range): Promise<Range>;
  rows(desc: IMatrixDataDescription, range: Range): Promise<string[]>;
  colIds(desc: IMatrixDataDescription, range: Range): Promise<Range>;
  cols(desc: IMatrixDataDescription, range: Range): Promise<string[]>;
  ids(desc: IMatrixDataDescription, range: Range): Promise<Range>;
  at(desc: IMatrixDataDescription, i: number, j: number): Promise<IValueType>;
  data(desc: IMatrixDataDescription, range: Range): Promise<IValueType[][]>;
  numericalHist?(desc: IMatrixDataDescription, range: Range, bins?: number): Promise<IHistogram>;
  heatmapUrl?(desc: IMatrixDataDescription, range: Range, options: IHeatMapUrlOptions): string;
}

function adapterOne2Two(loader: IMatrixLoader): IMatrixLoader2 {
  return {
    rowIds: (desc: IMatrixDataDescription, range: Range) => loader(desc).then((d) => range.preMultiply(d.rowIds, desc.size)),
    rows: (desc: IMatrixDataDescription, range: Range) => loader(desc).then((d) => range.dim(0).filter(d.rows, desc.size[0])),
    colIds: (desc: IMatrixDataDescription, range: Range) => loader(desc).then((d) => range.preMultiply(d.colIds, desc.size)),
    cols: (desc: IMatrixDataDescription, range: Range) => loader(desc).then((d) => range.dim(1).filter(d.cols, desc.size[1])),
    ids: (desc: IMatrixDataDescription, range: Range) => loader(desc).then((data) => range.preMultiply(data.ids, desc.size)),
    at: (desc: IMatrixDataDescription, i: number, j: number) => loader(desc).then((data) => data[i][j]),
    data: (desc: IMatrixDataDescription, range: Range) => loader(desc).then((d) => range.filter(d.data, desc.size))
  };
}

function maskIt(desc: IMatrixDataDescription) {
  if (desc.value.type === VALUE_TYPE_INT || desc.value.type === VALUE_TYPE_REAL) {
    return (v) => mask(v, <INumberValueTypeDesc>desc.value);
  }
  return (v) => v;
}

function viaAPI2Loader() {
  let rowIds = null,
    rows = null,
    colIds = null,
    cols = null,
    data = null,
    hist = null;
  const r = {
    rowIds: (desc: IMatrixDataDescription, range: Range) => {
      if (rowIds == null) {
        rowIds = getAPIJSON(`/dataset/matrix/${desc.id}/rowIds`).then(parse);
      }
      return rowIds.then((d) => d.preMultiply(range, desc.size));
    },
    rows: (desc: IMatrixDataDescription, range: Range) => {
      if (rows == null) {
        rows = getAPIJSON(`/dataset/matrix/${desc.id}/rows`);
      }
      return rows.then((d) => range.dim(0).filter(d, desc.size[0]));
    },
    colIds: (desc: IMatrixDataDescription, range: Range) => {
      if (colIds == null) {
        colIds = getAPIJSON(`/dataset/matrix/${desc.id}/colds`).then(parse);
      }
      return colIds.then((d) => d.preMultiply(range, desc.size));
    },
    cols: (desc: IMatrixDataDescription, range: Range) => {
      if (cols == null) {
        cols = getAPIJSON(`/dataset/matrix/${desc.id}/cols`);
      }
      return cols.then((d) => range.dim(1).filter(d, desc.size[1]));
    },
    ids: (desc: IMatrixDataDescription, range: Range) => {
      if (range.ndim === 1) {
        return r.rowIds(desc, range);
      }
      range.dim(0); //ensure two dim
      range.dim(1); //ensure two dim
      const split = range.split();
      return Promise.all([r.rowIds(desc, split[0] || all()), r.colIds(desc, split[1] || all())]).then(join);
    },
    numericalHist: (desc: IMatrixDataDescription, range: Range, bins: number = NaN) => {
      const valueRange = (<INumberValueTypeDesc>desc.value).range;
      if (range.isAll && isNaN(bins)) {
        if (hist == null) {
          hist = getAPIJSON(`/dataset/matrix/${desc.id}/hist`).then((hist: number[]) => wrapHist(hist, valueRange));
        }
        return hist;
      }
      const args: any = {
        range: range.toString()
      };
      if (!isNaN(bins)) {
        args.bins = bins;
      }
      return getAPIJSON(`/dataset/matrix/${desc.id}/hist`, args).then((hist: number[]) => wrapHist(hist, valueRange));
    },
    at: (desc: IMatrixDataDescription, i: number, j: number) => r.data(desc, rlist([i], [j])).then((data) => maskIt(desc)(data[0][0])),
    data: (desc: IMatrixDataDescription, range: Range) => {
      if (range.isAll) {
        if (data == null) {
          data = getAPIJSON(`/dataset/matrix/${desc.id}/raw`).then(maskIt(desc));
        }
        return data;
      }
      if (data != null) { //already loading all
        return data.then((d) => range.filter(d, desc.size));
      }
      const size = desc.size;
      if (size[0] * size[1] < 1000 || desc.loadAtOnce) { //small file load all
        data = getAPIJSON(`/dataset/matrix/${desc.id}/raw`).then(maskIt(desc));
        return data.then((d) => range.filter(d, desc.size));
      }
      //server side slicing
      return getAPIData(`/dataset/matrix/${desc.id}/raw`, {range: range.toString()}).then(maskIt(desc));
    },
    heatmapUrl: (desc: IMatrixDataDescription, range: Range, options: IHeatMapUrlOptions) => {
      let args: any = {
        format: options.format || 'png',
        range: range.toString()
      };
      if (options.transpose === true) {
        args.format_transpose = true;
      }
      if (options.range) {
        args.format_min = options.range[0];
        args.format_max = options.range[1];
      }
      if (options.palette) {
        args.format_palette = options.palette.toString();
      }
      return api2absURL(`/dataset/matrix/${desc.id}/data`, args);
    }
  };
  return r;
}

/**
 * root matrix implementation holding the data
 */
export class Matrix extends AMatrix {
  readonly t: IMatrix;
  readonly valuetype: IValueTypeDesc;
  readonly rowtype: IDType;
  readonly coltype: IDType;
  private producttype_: ProductIDType;

  constructor(public readonly desc: IMatrixDataDescription, private loader: IMatrixLoader2) {
    super(null);
    this.root = this;
    this.valuetype = desc.value;
    this.rowtype = resolveIDType(desc.rowtype);
    this.coltype = resolveIDType(desc.coltype);
    this.producttype_ = resolveProduct(this.rowtype, this.coltype);
    this.t = new TransposedMatrix(this);
  }

  get producttype() {
    return this.producttype_;
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
  at(i: number, j: number) {
    return this.loader.at(this.desc, i, j);
  }

  data(range: RangeLike = all()) {
    return this.loader.data(this.desc, parse(range));
  }

  ids(range: RangeLike = all()) {
    return this.loader.ids(this.desc, parse(range));
  }


  /**
   * return the column ids of the matrix
   * @returns {*}
   */
  cols(range: RangeLike = all()): Promise<string[]> {
    return this.loader.cols(this.desc, parse(range));
  }

  colIds(range: RangeLike = all()) {
    return this.loader.colIds(this.desc, parse(range));
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

  hist(bins?: number, range: RangeLike = all(), containedIds = 0): Promise<IHistogram> {
    if (this.loader.numericalHist && (this.valuetype.type === VALUE_TYPE_REAL || this.valuetype.type === VALUE_TYPE_INT)) { // use loader for hist
      return this.loader.numericalHist(this.desc, parse(range), bins);
    }
    // compute
    return super.hist(bins, range, containedIds);
  }

  size() {
    return this.desc.size;
  }

  persist() {
    return this.desc.id;
  }

  heatmapUrl(range = all(), options: IHeatMapUrlOptions = {}) {
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
class TransposedMatrix extends AMatrix {
  readonly t: IMatrix;

  constructor(base: Matrix) {
    super(base);
    this.t = base;
  }

  get desc() {
    return this.root.desc;
  }

  persist() {
    return {
      root: this.root.persist(),
      transposed: true
    };
  }

  get valuetype() {
    return this.root.valuetype;
  }

  get rowtype() {
    return this.root.coltype;
  }

  get coltype() {
    return this.root.rowtype;
  }

  get producttype() {
    return this.root.producttype;
  }

  get idtypes() {
    return [this.rowtype, this.coltype];
  }

  ids(range: RangeLike = all()) {
    return this.t.ids(range ? parse(range).swap() : undefined).then((ids) => ids.swap());
  }

  cols(range: RangeLike = all()): Promise<string[]> {
    return this.t.rows(range ? parse(range).swap() : undefined);
  }

  colIds(range: RangeLike = all()) {
    return this.t.rowIds(range ? parse(range).swap() : undefined);
  }

  rows(range: RangeLike = all()): Promise<string[]> {
    return this.t.cols(range ? parse(range).swap() : undefined);
  }

  rowIds(range: RangeLike = all()) {
    return this.t.colIds(range ? parse(range).swap() : undefined);
  }

  view(range: RangeLike = all()): IMatrix {
    const r = parse(range);
    if (r.isAll) {
      return this;
    }
    return new MatrixView(this.root, r.swap()).t;
  }

  slice(col: number): IVector {
    return new SliceRowVector(this.root, col);
  }

  size() {
    const s = this.t.dim;
    return [s[1], s[0]]; //swap dimension
  }

  at(i: number, j: number) {
    return this.t.at(j, i);
  }

  data(range: RangeLike = all()) {
    return this.t.data(range ? parse(range).swap() : undefined).then((data: IValueType[][]) => transpose(data));
  }

  hist(bins?: number, range: RangeLike = all(), containedIds = 0): Promise<IHistogram> {
    return this.t.hist(bins, range ? parse(range).swap() : undefined, 1 - containedIds);
  }

  heatmapUrl(range: RangeLike = all(), options: IHeatMapUrlOptions = {}) {
    options.transpose = options.transpose !== true;
    return this.t.heatmapUrl(range ? parse(range).swap() : undefined, options);
  }
}

/**
 * view on the matrix restricted by a range
 * @param root underlying matrix
 * @param range range selection
 * @param t optional its transposed version
 * @constructor
 */
class MatrixView extends AMatrix {
  constructor(root: IMatrix, private range: Range, public readonly t: IMatrix = null) {
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
    return this.root.desc;
  }

  persist() {
    return {
      root: this.root.persist(),
      range: this.range.toString()
    };
  }

  ids(range: RangeLike = all()) {
    return this.root.ids(this.range.preMultiply(parse(range), this.root.dim));
  }

  cols(range: RangeLike = all()) {
    return this.root.cols(this.range.preMultiply(parse(range), this.root.dim));
  }

  colIds(range: RangeLike = all()) {
    return this.root.colIds(this.range.preMultiply(parse(range), this.root.dim));
  }

  rows(range: RangeLike = all()) {
    return this.root.rows(this.range.preMultiply(parse(range), this.root.dim));
  }

  rowIds(range: RangeLike = all()) {
    return this.root.rowIds(this.range.preMultiply(parse(range), this.root.dim));
  }

  size() {
    return this.range.size(this.root.dim);
  }

  at(i: number, j: number) {
    const inverted = this.range.invert([i, j], this.root.dim);
    return this.root.at(inverted[0], inverted[1]);
  }

  data(range: RangeLike = all()) {
    return this.root.data(this.range.preMultiply(parse(range), this.root.dim));
  }

  hist(bins?: number, range: RangeLike = all(), containedIds = 0): Promise<IHistogram> {
    return this.root.hist(bins, this.range.preMultiply(parse(range), this.root.dim), containedIds);
  }

  heatmapUrl(range = all(), options: IHeatMapUrlOptions = {}) {
    return this.root.heatmapUrl(this.range.preMultiply(parse(range), this.root.dim), options);
  }

  view(range: RangeLike = all()) {
    const r = parse(range);
    if (r.isAll) {
      return this;
    }
    return new MatrixView(this.root, this.range.preMultiply(r, this.dim));
  }

  get valuetype() {
    return this.root.valuetype;
  }

  get rowtype() {
    return this.root.rowtype;
  }

  get coltype() {
    return this.root.coltype;
  }

  get producttype() {
    return this.root.producttype;
  }

  get idtypes() {
    return this.root.idtypes;
  }
}


/**
 * a simple projection of a matrix columns to a vector
 */
class SliceColVector extends AVector {
  readonly desc: IVectorDataDescription;
  private colRange: Range1D;

  constructor(private m: IMatrix, private col: number) {
    super(null);
    this.colRange = Range1D.from([this.col]);
    this.desc = {
      name: m.desc.name + '-c' + col,
      fqname: m.desc.fqname + '-c' + col,
      id: m.desc.id + '-c' + col,
      type: 'vector',
      idtype: m.rowtype,
      size: this.dim[0],
      value: this.valuetype,
      description: m.desc.description,
      creator: m.desc.creator,
      ts: m.desc.ts
    };
    this.root = this;
  }

  persist() {
    return {
      root: this.m.persist(),
      col: this.col
    };
  }

  restore(persisted: any) {
    let r: IVector = this;
    if (persisted && persisted.range) { //some view onto it
      r = r.view(parse(persisted.range));
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
  names(range?: Range): Promise<string[]> {
    return this.m.rows(range);
  }

  ids(range?: RangeLike) {
    return this.m.rowIds(range);
  }

  /**
   * returns a promise for getting one cell
   * @param i
   */
  at(i: number): Promise<IValueType> {
    return this.m.at(i, this.col);
  }

  /**
   * returns a promise for getting the data as two dimensional array
   * @param range
   */
  data(range: RangeLike = all()): Promise<IValueType[]> {
    const rr = parse(range);
    const r = rlist(rr.dim(0), this.colRange);
    return this.m.data(r).then((d) => {
      if (d.length > 0 && Array.isArray(d[0])) {
        return d.map((di) => di[0]);
      }
      return d;
    });
  }

  sort(compareFn?: (a: IValueType, b: IValueType) => number, thisArg?: any): Promise<IVector> {
    return this.data().then((d) => {
      const indices = argSort(d, compareFn, thisArg);
      return this.view(rlist(indices));
    });
  }

  map<U>(callbackfn: (value: IValueType, index: number) => U, thisArg?: any): Promise<IVector> {
    //FIXME
    return null;
  }

  filter(callbackfn: (value: IValueType, index: number) => boolean, thisArg?: any): Promise<IVector> {
    return this.data().then((d) => {
      const indices = argFilter(d, callbackfn, thisArg);
      return this.view(rlist(indices));
    });
  }
}


/**
 * a simple projection of a matrix columns to a vector
 */
class SliceRowVector extends AVector implements IVector {
  readonly desc: IVectorDataDescription;
  private rowRange: Range1D;

  constructor(private m: IMatrix, private row: number) {
    super(null);
    this.rowRange = Range1D.from([this.row]);
    this.desc = {
      name: m.desc.name + '-r' + row,
      fqname: m.desc.fqname + '-r' + row,
      id: m.desc.id + '-r' + row,
      type: 'vector',
      idtype: m.coltype,
      size: this.dim[1],
      value: this.valuetype,
      description: m.desc.description,
      creator: m.desc.creator,
      ts: m.desc.ts
    };
    this.root = this;
  }

  persist() {
    return {
      root: this.m.persist(),
      row: this.row
    };
  }

  restore(persisted: any) {
    let r: IVector = this;
    if (persisted && persisted.range) { //some view onto it
      r = r.view(parse(persisted.range));
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
  names(range?: RangeLike): Promise<string[]> {
    return this.m.cols(range);
  }

  ids(range?: RangeLike) {
    return this.m.colIds(range);
  }

  /**
   * returns a promise for getting one cell
   * @param i
   */
  at(i: number): Promise<IValueType> {
    return this.m.at(this.row, i);
  }

  /**
   * returns a promise for getting the data as two dimensional array
   * @param range
   */
  data(range: RangeLike = all()): Promise<any[]> {
    const rr = parse(range);
    const r = rlist(this.rowRange, rr.dim(0));
    return this.m.data(r).then((d) => d[0]);
  }

  sort(compareFn?: (a: IValueType, b: IValueType) => number, thisArg?: any): Promise<IVector> {
    return this.data().then((d) => {
      const indices = argSort(d, compareFn, thisArg);
      return this.view(rlist(indices));
    });
  }

  filter(callbackfn: (value: IValueType, index: number) => boolean, thisArg?: any): Promise<IVector> {
    return this.data().then((d) => {
      const indices = argFilter(d, callbackfn, thisArg);
      return this.view(rlist(indices));
    });
  }
}

/**
 * a simple projection of a matrix columns to a vector
 */
class ProjectedVector extends AVector implements IVector {
  readonly desc: IVectorDataDescription;

  constructor(private m: IMatrix, private f: (row: IValueType[]) => any, private this_f = m, public readonly valuetype = m.valuetype, private _idtype = m.rowtype) {
    super(null);
    this.desc = {
      name: m.desc.name + '-p',
      fqname: m.desc.fqname + '-p',
      type: 'vector',
      id: m.desc.id + '-p',
      size: this.dim[0],
      idtype: m.rowtype,
      value: this.valuetype,
      description: m.desc.description,
      creator: m.desc.creator,
      ts: m.desc.ts
    };
    this.root = this;
  }

  persist() {
    return {
      root: this.m.persist(),
      f: this.f.toString(),
      valuetype: this.valuetype === this.m.valuetype ? undefined : this.valuetype,
      idtype: this.idtype === this.m.rowtype ? undefined : this.idtype.name
    };
  }

  restore(persisted: any) {
    let r: IVector = this;
    if (persisted && persisted.range) { //some view onto it
      r = r.view(parse(persisted.range));
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
  names(range?: RangeLike): Promise<string[]> {
    return this.m.rows(range);
  }

  ids(range?: RangeLike) {
    return this.m.rowIds(range);
  }

  /**
   * returns a promise for getting one cell
   * @param i
   */
  at(i: number): Promise<IValueType> {
    return this.m.data(rlist(i)).then((d) => {
      return this.f.call(this.this_f, d[0]);
    });
  }

  /**
   * returns a promise for getting the data as two dimensional array
   * @param range
   */
  data(range?: RangeLike): Promise<IValueType[]> {
    return this.m.data(range).then((d) => {
      return d.map(this.f, this.this_f);
    });
  }

  sort(compareFn?: (a: IValueType, b: IValueType) => number, thisArg?: any): Promise<IVector> {
    return this.data().then((d) => {
      const indices = argSort(d, compareFn, thisArg);
      return this.view(rlist(indices));
    });
  }

  filter(callbackfn: (value: IValueType, index: number) => boolean, thisArg?: any): Promise<IVector> {
    return this.data().then((d) => {
      const indices = argFilter(d, callbackfn, thisArg);
      return this.view(rlist(indices));
    });
  }
}

/**
 * module entry point for creating a datatype
 * @param desc
 * @param loader
 * @returns {IMatrix}
 */
export function create(desc: IMatrixDataDescription, loader?: IMatrixLoader2): IMatrix {
  if (typeof((<any>desc).loader) === 'function') {
    return new Matrix(desc, adapterOne2Two((<any>desc).loader));
  }
  return new Matrix(desc, loader ? loader : viaAPI2Loader());
}
