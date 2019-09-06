/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 *
 * This file defines interfaces for various data types and their metadata.
 */

import { IDType, ISelectAble, SelectAble } from './idtype';
import { extendClass, IPersistable, mixin, uniqueString } from './index';
import { extent, IAdvancedStatistics, IHistogram, IStatistics } from './math';
import { all, composite, CompositeRange1D, none, Range, Range1D, Range1DGroup, RangeLike } from './range';
import { currentUserNameOrAnonymous, ISecureItem } from './security';

/**
 * Interface defining metadata for a dataset.
 */
export interface IDataDescriptionMetaData extends ISecureItem {
  /**
   * the type of the datatype, e.g. matrix, vector, stratification, ...
   */
  readonly type: string;

  /**
   * the name of the dataset
   */
  readonly name: string;

  readonly description: string;
  /**
   * a fully qualified name, e.g. project_name/name
   */
  readonly fqname: string;

  /**
   * custom properties that can be added on the fly
   * @see https://www.typescriptlang.org/docs/handbook/interfaces.html#indexable-types
   * Note: This property needs to be writable to set it later on (e.g. in VectorTable)
   */
  [extras: string]: any;

  /**
   * creation time stamp
   */
  readonly ts: number;
}
/**
 * basic description elements
 */
export interface IDataDescription extends IDataDescriptionMetaData {
  /**
   * the unique id
   */
  readonly id: string;
}

/**
 * Basic data type interface
 */
export interface IDataType extends ISelectAble, IPersistable {
  /**
   * its description
   */
  readonly desc: IDataDescription;
  /**
   * dimensions of this datatype
   * rows, cols, ....
   */
  readonly dim: number[];


  idView(idRange?: RangeLike): Promise<IDataType>;
}

export const VALUE_TYPE_CATEGORICAL = 'categorical';
export const VALUE_TYPE_STRING = 'string';
export const VALUE_TYPE_REAL = 'real';
export const VALUE_TYPE_INT = 'int';

export interface IValueTypeDesc {
  type: string;
}

export interface INumberValueTypeDesc extends IValueTypeDesc {
  readonly type: 'int'|'real';
  /**
   * min, max
   */
  readonly range: [number, number];
  /**
   * missing value
   */
  readonly missing?: number;
}

export interface ICategory {
  readonly name: string;
  readonly color?: string;
  readonly label?: string;
}

export interface ICategoricalValueTypeDesc extends IValueTypeDesc {
  readonly type: 'categorical';
  readonly categories: (ICategory|string)[];
}

export interface IStringValueTypeDesc extends IValueTypeDesc {
  readonly type: 'string';
}

export declare type IValueType = number | string | any;


/**
 * utility to assign a dataset to an html element, similar to d3
 * @param node
 * @param data
 */
export function assignData(node: Element, data: IDataType) {
  (<any>node).__data__ = data;
}


export interface IHistAbleDataType<D extends IValueTypeDesc> extends IDataType {
  valuetype: D;
  hist(nbins?: number): Promise<IHistogram | null>;
  readonly length: number;
}

export interface IStatsAbleDataType<D extends IValueTypeDesc> extends IDataType {
  valuetype: D;
  stats(): Promise<IStatistics>;
  statsAdvanced(): Promise<IAdvancedStatistics>;
  readonly length: number;
}


/**
 * dummy data type just holding the description
 */
export abstract class ADataType<T extends IDataDescription> extends SelectAble implements IDataType {
  constructor(public readonly desc: T) {
    super();
  }

  get dim(): number[] {
    return [];
  }

  ids(_range: RangeLike = all()): Promise<Range> {
    return Promise.resolve(none());
  }

  idView(_idRange?: RangeLike): Promise<ADataType<T>> {
    return Promise.resolve(this);
  }

  get idtypes(): IDType[] {
    return [];
  }

  persist(): any {
    return this.desc.id;
  }

  restore(_persisted: any) {
    return this;
  }

  toString() {
    return this.persist();
  }
}

export class DummyDataType extends ADataType<IDataDescription> {
  constructor(desc: IDataDescription) {
    super(desc);
  }

}

/**
 * since there is no instanceOf for interfaces
 * @param v
 * @return {any}
 */
export function isDataType(v: IDataType) {
  if (v === null || v === undefined) {
    return false;
  }
  if (v instanceof ADataType) {
    return true;
  }
  //sounds good
  return (typeof(v.idView) === 'function' && typeof(v.persist) === 'function' && typeof(v.restore) === 'function' && v instanceof SelectAble && ('desc' in v) && ('dim' in v));
}

/**
 * transpose the given matrix
 * @param m
 * @returns {*}
 */
export function transpose(m: any[][]) {
  if (m.length === 0 || m[0].length === 0) {
    return [];
  }
  const r = m[0].map((i) => [i]);
  for (let i = 1; i < m.length; ++i) {
    m[i].forEach((v, i) => r[i].push(v));
  }
  return r;
}

function maskImpl(arr: number|number[], missing: number|undefined): number|number[] {
  if (Array.isArray(arr)) {
    const vs = <number[]>arr;
    if (missing && vs.indexOf(missing) >= 0) {
      return vs.map((v) => v === missing ? NaN : v);
    }
  }
  return arr === missing ? NaN : arr;
}

export function mask(arr: number|number[], desc: INumberValueTypeDesc): number|number[] {
  if (desc.type === VALUE_TYPE_INT && 'missing' in desc) {
    return maskImpl(arr, desc.missing);
  }
  if (desc.type === VALUE_TYPE_INT || desc.type === VALUE_TYPE_REAL) {
    // replace null values with Number.NaN
    return maskImpl(arr, undefined);
  }
  return arr;
}

export interface ICategorical2PartitioningOptions {

  /**
   * name of the partitioning
   * default: 'Partitioning'
   */
  name?: string;
  /**
   * default: true
   */
  skipEmptyCategories?: boolean;
  /**
   * colors for categories, more will be rotated
   * default: ['gray']
   */
  colors?: string[];
  /**
   * labels for categories, need to match exactly
   * default: null
   */
  labels?: string[] | undefined;
}

/**
 * converts the given categorical data to a grouped range
 * @param data
 * @param categories
 * @param options
 * @return {CompositeRange1D}
 */
export function categorical2partitioning<T extends Object>(data: T[], categories: T[], options: ICategorical2PartitioningOptions = {}): CompositeRange1D {
  const m: ICategorical2PartitioningOptions = mixin({
    skipEmptyCategories: true,
    colors: ['gray'],
    labels: null,
    name: 'Partitioning'
  }, options);

  let groups = categories.map((d, i) => {
    return {
      indices: <number[]>[],
      name: m.labels ? m.labels[i] : d.toString(),
      color: m.colors ? m.colors[Math.min(i, m.colors.length - 1)] : 'gray',
    };
  });
  data.forEach((d, j) => {
    const i = categories.indexOf(d);
    if (i >= 0) {
      groups[i].indices.push(j);
    }
  });
  if (m.skipEmptyCategories) {
    groups = groups.filter((g) => g.indices.length > 0);
  }
  const granges = groups.map((g) => {
    return new Range1DGroup(g.name, g.color, Range1D.from(g.indices));
  });
  return composite(m.name ? m.name : 'TODO', granges);
}

/**
 * utility function to create a datatype, designed for JavaScript usage
 * @param name
 * @param functions the functions to add
 * @return {function(IDataDescription): undefined}
 */
export function defineDataType(name: string, functions: any) {
  function DataType(this: any, desc: IDataDescription) {
    (<any>ADataType).call(this, desc);
    if (typeof(this.init) === 'function') {
      this.init.apply(this, Array.from(arguments));
    }
  }

  extendClass(DataType, ADataType);
  DataType.prototype.toString = () => name;
  mixin(DataType.prototype, functions);

  return DataType;
}


function isNumeric(obj: any) {
  return (obj - parseFloat(obj) + 1) >= 0;
}


/**
 * guesses the type of the given value array returning its description
 * @param arr
 * @return {any}
 */
export function guessValueTypeDesc(arr: IValueType[]): IValueTypeDesc {
  if (arr.length === 0) {
    return {type: 'string'}; //doesn't matter
  }
  const test = arr[0];
  if (typeof test === 'number' || isNumeric(test)) {
    return <INumberValueTypeDesc>{type: VALUE_TYPE_REAL, range: extent(arr.map(parseFloat))};
  }
  const values = new Set(<string[]>arr);
  if (values.size < arr.length * 0.2 || values.size < 8) {
    //guess as categorical
    return <ICategoricalValueTypeDesc>{type: 'categorical', categories: Array.from(values.values())};
  }
  return <IStringValueTypeDesc>{type: 'string'};
}


/**
 * creates a default data description
 * @return {{type: string, id: string, name: string, fqname: string, description: string, creator: string, ts: number}}
 */
export function createDefaultDataDesc(namespace = 'localData'): IDataDescription {
  const id = uniqueString(namespace);
  return {
    type: 'default',
    id,
    name: id,
    fqname: id,
    description: '',
    creator: currentUserNameOrAnonymous(),
    ts: Date.now()
  };
}


