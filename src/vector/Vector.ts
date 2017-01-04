/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */


import {mixin} from '../index';
import {argSort, argFilter} from '../index';
import {all, Range, RangeLike, list as rlist, parse} from '../range';
import {resolve, createLocalAssigner} from '../idtype';
import {
  mask, INumberValueTypeDesc, VALUE_TYPE_INT, VALUE_TYPE_REAL, guessValueTypeDesc,
  IValueTypeDesc
} from '../datatype';
import {IVector, IVectorDataDescription, createDefaultVectorDesc} from './IVector';
import AVector from './AVector';
import {IVectorLoader, viaAPILoader, viaDataLoader, IVectorLoaderResult} from './loader';
/**
 * root matrix implementation holding the data
 */
export default class Vector<T,D extends IValueTypeDesc> extends AVector<T,D> {

  constructor(public readonly desc: IVectorDataDescription<D>, private loader: IVectorLoader<T>) {
    super(null);
    this.root = this;
  }

  get valuetype() {
    return this.desc.value;
  }

  get idtype() {
    return resolve(this.desc.idtype);
  }

  /**
   * loads all the underlying data in json format
   * TODO: load just needed data and not everything given by the requested range
   * @returns {*}
   */
  private load(): Promise<IVectorLoaderResult<T>> {
    return this.loader(this.desc);
  }

  /**
   * access at a specific position
   * @param i
   * @returns {*}
   */
  at(i: number) {
    return this.load().then((d) => d.data[i]);
  }

  data(range: RangeLike = all()) {
    return this.load().then((data) => {
      const d = parse(range).filter(data.data, this.dim);
      if ((this.valuetype.type === VALUE_TYPE_REAL || this.valuetype.type === VALUE_TYPE_INT)) {
        return mask(d, <INumberValueTypeDesc><any>this.valuetype);
      }
      return d;
    });
  }

  names(range: RangeLike = all()) {
    return this.load().then((data) => {
      return parse(range).filter(data.rows, this.dim);
    });
  }

  ids(range: RangeLike = all()): Promise<Range> {
    return this.load().then((data) => data.rowIds.preMultiply(parse(range), this.dim));
  }

  get idtypes() {
    return [this.idtype];
  }

  size() {
    return this.desc.size;
  }

  sort(compareFn?: (a: T, b: T) => number, thisArg?: any): Promise<IVector<T,D>> {
    return this.data().then((d) => {
      const indices = argSort(d, compareFn, thisArg);
      return this.view(rlist(indices));
    });
  }

  filter(callbackfn: (value: T, index: number) => boolean, thisArg?: any): Promise<IVector<T,D>> {
    return this.data().then((d) => {
      const indices = argFilter(d, callbackfn, thisArg);
      return this.view(rlist(indices));
    });
  }

  persist() {
    return this.desc.id;
  }
}

/**
 * module entry point for creating a datatype
 * @param desc
 * @returns {IVector}
 */
export function create<T, D extends IValueTypeDesc>(desc: IVectorDataDescription<D>): IVector<T,D> {
  if (typeof((<any>desc).loader) === 'function') {
    return new Vector(desc, <IVectorLoader<T>>(<any>desc).loader);
  }
  return new Vector(desc, viaAPILoader());
}

export function wrap<T, D extends IValueTypeDesc>(desc: IVectorDataDescription<D>, rows: string[], rowIds: number[], data: T[]) {
  return new Vector(desc, viaDataLoader(rows, rowIds, data));
}


export interface IAsVectorOptions {
  name?: string;
  idtype?: string;
  rowassigner?(ids: string[]): Range;
}

export function asVector<T>(rows: string[], data: T[], options: IAsVectorOptions = {}) {
  const desc = mixin(createDefaultVectorDesc(), {
    size: data.length,
    value: guessValueTypeDesc(data)
  }, options);

  const rowAssigner = options.rowassigner || createLocalAssigner();
  return new Vector(desc, viaDataLoader(rows, rowAssigner(rows), data));
}
