/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */

import {all, Range, RangeLike, range, CompositeRange1D, asUngrouped, composite, parse} from '../range';
import {SelectAble} from '../idtype';
import {
  categorical2partitioning,
  IValueType,
  ICategorical2PartitioningOptions,
  ICategory,
  ICategoricalValueTypeDesc,
  INumberValueTypeDesc,
  VALUE_TYPE_CATEGORICAL,
  VALUE_TYPE_INT,
  VALUE_TYPE_REAL
} from '../datatype';
import {computeStats, IStatistics, IHistogram, categoricalHist, hist} from '../math';
import {IVector} from './IVector';
import {IStratification} from '../stratification';
import VectorView from './internal/VectorView';
import StratificationVector from './internal/StratificationVector';
/**
 * base class for different Vector implementations, views, transposed,...
 */
export abstract class AVector extends SelectAble {
  constructor(protected root: IVector) {
    super();
  }

  get dim() {
    return [this.length];
  }

  abstract data(range?: RangeLike): Promise<any[]>;

  abstract size(): number;

  get length() {
    return this.size();
  }

  view(range: RangeLike = all()): IVector {
    return new VectorView(this.root, parse(range));
  }

  idView(idRange: RangeLike = all()): Promise<IVector> {
    return this.ids().then((ids) => this.view(ids.indexOf(parse(idRange))));
  }

  stats(): Promise<IStatistics> {
    return this.data().then((d) => computeStats(d));
  }

  get indices(): Range {
    return range(0, this.length);
  }

  /**
   * return the range of this vector as a grouped range, depending on the type this might be a single group or multiple ones
   */
  groups(): Promise<CompositeRange1D> {
    const v = this.root.valuetype;
    if (v.type === VALUE_TYPE_CATEGORICAL) {
      const vc = <ICategoricalValueTypeDesc>v;
      return this.data().then((d) => {
        const options: ICategorical2PartitioningOptions = {
          name: this.root.desc.id
        };
        if (typeof vc.categories[0] !== 'string') {
          const vcc = <ICategory[]>vc.categories;
          if (vcc[0].color) {
            options.colors = vcc.map((d) => d.color);
          }
          if (vcc[0].label) {
            options.labels = vcc.map((d) => d.label);
          }
        }
        return categorical2partitioning(d, vc.categories.map((d) => typeof d === 'string' ? d : d.name), options);
      });
    } else {
      return Promise.resolve(composite(this.root.desc.id, [asUngrouped(this.indices.dim(0))]));
    }
  }

  stratification(): Promise<IStratification> {
    return this.asStratification();
  }

  asStratification(): Promise<IStratification> {
    return this.groups().then((range) => {
      return new StratificationVector(this.root, range);
    });
  }

  hist(bins?: number, range: RangeLike = all()): Promise<IHistogram> {
    const v = this.root.valuetype;
    return this.data(range).then((d) => {
      switch (v.type) {
        case VALUE_TYPE_CATEGORICAL:
          const vc = <ICategoricalValueTypeDesc>v;
          return categoricalHist(d, this.indices.dim(0), d.length, vc.categories.map((d) => typeof d === 'string' ? d : d.name),
            vc.categories.map((d) => typeof d === 'string' ? d : d.name || d.label),
            vc.categories.map((d) => typeof d === 'string' ? 'gray' : d.color || 'gray'));
        case VALUE_TYPE_REAL:
        case VALUE_TYPE_INT:
          const vn = <INumberValueTypeDesc>v;
          return hist(d, this.indices.dim(0), d.length, bins ? bins : Math.round(Math.sqrt(this.length)), vn.range);
        default:
          return null; //cant create hist for unique objects or other ones
      }
    });
  }

  every(callbackfn: (value: IValueType, index: number) => boolean, thisArg?: any): Promise<boolean> {
    return this.data().then((d) => d.every(callbackfn, thisArg));
  }

  some(callbackfn: (value: IValueType, index: number) => boolean, thisArg?: any): Promise<boolean> {
    return this.data().then((d) => d.some(callbackfn, thisArg));
  }

  forEach(callbackfn: (value: IValueType, index: number) => void, thisArg?: any): void {
    this.data().then((d) => d.forEach(callbackfn, thisArg));
  }

  reduce<T,U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number) => U, initialValue: U, thisArg?: any): Promise<U> {
    function helper() {
      return callbackfn.apply(thisArg, Array.from(arguments));
    }

    return this.data().then((d) => d.reduce(helper, initialValue));
  }

  reduceRight<T,U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number) => U, initialValue: U, thisArg?: any): Promise<U> {
    function helper() {
      return callbackfn.apply(thisArg, Array.from(arguments));
    }

    return this.data().then((d) => d.reduceRight(helper, initialValue));
  }

  restore(persisted: any) {
    let r: IVector = <IVector>(<any>this);
    if (persisted && persisted.range) { //some view onto it
      r = r.view(parse(persisted.range));
    }
    return r;
  }
}

export default AVector;
