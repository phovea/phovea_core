/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */

import {RangeLike, all, parse, Range} from '../../range';
import {IMatrix, IHeatMapUrlOptions} from '../IMatrix';
import AMatrix from '../AMatrix';
import {IHistogram} from '../../math';

/**
 * view on the matrix restricted by a range
 * @param root underlying matrix
 * @param range range selection
 * @param t optional its transposed version
 * @constructor
 */
export default class MatrixView extends AMatrix {
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
