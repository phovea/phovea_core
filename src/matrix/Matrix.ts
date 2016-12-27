/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */

import {Range, RangeLike, all, parse, join} from '../range';
import {IValueTypeDesc, IValueType, VALUE_TYPE_REAL, VALUE_TYPE_INT, guessValueTypeDesc} from '../datatype';
import {IHistogram} from '../math';
import {mixin} from '../index';
import {IDType, ProductIDType, resolve as resolveIDType, resolveProduct, createLocalAssigner} from '../idtype';
import {IMatrix, IMatrixDataDescription, IHeatMapUrlOptions, createDefaultMatrixDesc} from './IMatrix';
import AMatrix from './AMatrix';
import TransposedMatrix from './internal/TransposedMatrix';
import {IMatrixLoader, IMatrixLoader2, viaAPI2Loader, adapterOne2Two} from './loader';
/**
 * root matrix implementation holding the data
 */
export default class Matrix extends AMatrix {
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
 * module entry point for creating a datatype
 * @param desc
 * @param loader
 * @returns {IMatrix}
 */
export function create(desc: IMatrixDataDescription, loader?: IMatrixLoader2|IMatrixLoader): IMatrix {
  if (typeof loader === 'function') {
    return new Matrix(desc, adapterOne2Two(<IMatrixLoader>loader));
  }
  return new Matrix(desc, loader ? loader : viaAPI2Loader());
}


export interface IAsMatrixOptions {
  name?: string;
  rowtype?: string;
  coltype?: string;
  rowassigner?(ids: string[]): Range;
  colassigner?(ids: string[]): Range;
}

export function asMatrix(data: IValueType[][]): IMatrix;
export function asMatrix(data: IValueType[][], options?: IAsMatrixOptions): IMatrix;
export function asMatrix(data: IValueType[][], rows: string[], cols: string[]): IMatrix;
export function asMatrix(data: IValueType[][], rows: string[], cols: string[], options?: IAsMatrixOptions): IMatrix;

/**
 * parses a given dataset and convert is to a matrix
 * @param data the data array
 * @param rows_or_options see options or the row ids of this matrix
 * @param cols_def the optional column ids
 * @param options options for defining the dataset description
 * @returns {IMatrix}
 */
export function asMatrix(data: IValueType[][], rows_or_options?: any, cols_def?: string[], options: IAsMatrixOptions = {}): IMatrix {
  const cols = cols_def ? cols_def : data.slice().shift().slice(1);
  const rows = Array.isArray(rows_or_options) ? <string[]>rows_or_options : data.map((r) => r[0]).slice(1);
  if (typeof rows_or_options === 'object') {
    options = rows_or_options;
  }
  options = options || {};

  let realData = Array.isArray(rows_or_options) ? data : data.map((r) => r.slice(1)).slice(1);

  const valueType = guessValueTypeDesc([].concat.apply([], realData));

  if (valueType.type === VALUE_TYPE_REAL) {
    realData = realData.map((row) => row.map(parseFloat));
  } else if (valueType.type === VALUE_TYPE_REAL) {
    realData = realData.map((row) => row.map(parseInt));
  }

  const desc = mixin(createDefaultMatrixDesc(), {
    size: [rows.length, cols.length],
    value: valueType
  }, options);

  const rowAssigner = options.rowassigner || createLocalAssigner();
  const colAssigner = options.rowassigner || createLocalAssigner();
  const loader: IMatrixLoader2 = {
    rowIds: (desc: IMatrixDataDescription, range: Range) => Promise.resolve(rowAssigner(range.filter(rows))),
    colIds: (desc: IMatrixDataDescription, range: Range) => Promise.resolve(colAssigner(range.filter(cols))),
    ids: (desc: IMatrixDataDescription, range: Range) => {
      const rc = rowAssigner(range.dim(0).filter(rows));
      const cc = colAssigner(range.dim(1).filter(cols));
      return Promise.resolve(join(rc, cc));
    },
    at: (desc: IMatrixDataDescription, i, j) => Promise.resolve(realData[i][j]),
    rows: (desc: IMatrixDataDescription, range: Range) => Promise.resolve(range.filter(rows)),
    cols: (desc: IMatrixDataDescription, range: Range) => Promise.resolve(range.filter(cols)),
    data: (desc: IMatrixDataDescription, range: Range) => Promise.resolve(range.filter(realData))
  };
  return new Matrix(desc, loader);
}
