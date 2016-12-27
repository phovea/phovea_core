/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */

import {RangeLike, all, parse} from '../../range';
import {IValueType, transpose} from '../../datatype';
import {IMatrix, IHeatMapUrlOptions} from '../IMatrix';
import AMatrix from '../AMatrix';
import Matrix from '../Matrix';
import SliceRowVector from './SliceRowVector';
import MatrixView from './MatrixView';
import {IVector} from '../../vector';
import {IHistogram} from '../../math';

/**
 * view on the underlying matrix as transposed version
 * @param base
 * @constructor
 */
export default class TransposedMatrix extends AMatrix {
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
