/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */

import {argSort, argFilter} from '../../index';
import {list as rlist, RangeLike, all, parse, Range1D} from '../../range';
import {IValueType} from '../../datatype';
import {IVector, IVectorDataDescription} from '../../vector';
import AVector from '../../vector/AVector';
import {IMatrix} from '../IMatrix';

/**
 * a simple projection of a matrix columns to a vector
 */
export default class SliceRowVector extends AVector implements IVector {
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
