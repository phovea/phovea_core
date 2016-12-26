/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */

import {argSort, argFilter} from '../index';
import {all, Range, RangeLike, list as rlist, parse} from '../range';
import {IValueType} from '../datatype';
import {IVector} from './IVector';
import AVector from './AVector';


/**
 * view on the vector restricted by a range
 * @param root underlying matrix
 * @param range range selection
 * @param t optional its transposed version
 * @constructor
 */
export default class VectorView extends AVector {
  constructor(root: IVector, private range: Range) {
    super(root);
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

  size() {
    return this.range.size(this.root.dim)[0];
  }

  at(i: number) {
    const inverted = this.range.invert([i], this.root.dim);
    return this.root.at(inverted[0]);
  }

  data(range: RangeLike = all()) {
    return this.root.data(this.range.preMultiply(parse(range), this.root.dim));
  }

  names(range: RangeLike = all()) {
    return this.root.names(this.range.preMultiply(parse(range), this.root.dim));
  }

  ids(range: RangeLike = all()) {
    return this.root.ids(this.range.preMultiply(parse(range), this.root.dim));
  }

  view(range: RangeLike = all()) {
    const r = parse(range);
    if (r.isAll) {
      return this;
    }
    return new VectorView(this.root, this.range.preMultiply(r, this.dim));
  }

  get valuetype() {
    return this.root.valuetype;
  }

  get idtype() {
    return this.root.idtype;
  }

  get idtypes() {
    return [this.idtype];
  }

  /*get indices() {
   return this.range;
   }*/

  sort(compareFn?: (a: IValueType, b: IValueType) => number, thisArg?: any): Promise<IVector> {
    return this.data().then((d) => {
      const indices = argSort(d, compareFn, thisArg);
      return this.view(this.range.preMultiply(rlist(indices)));
    });
  }

  filter(callbackfn: (value: IValueType, index: number) => boolean, thisArg?: any): Promise<IVector> {
    return this.data().then((d) => {
      const indices = argFilter(d, callbackfn, thisArg);
      return this.view(this.range.preMultiply(rlist(indices)));
    });
  }
}
