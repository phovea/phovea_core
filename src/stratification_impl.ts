/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */

import {argFilter, argSort} from './index';
import {getAPIJSON} from './ajax';
import {parse, Range1DGroup, composite, Range, list as rlist, CompositeRange1D, all} from './range';
import {resolve as resolveIDType} from './idtype';
import {
  IDataDescription, DataTypeBase, IDataType, ICategoricalValueTypeDesc,
  VALUE_TYPE_CATEGORICAL
} from './datatype';
import {getFirstByFQName} from './data';
import {IVector, IVectorDataDescription} from './vector';
import {VectorBase} from './vector_impl';
import {rangeHist, IHistogram} from './math';
import {IStratification, StratificationGroup, IStratificationDataDescription} from './stratification';

export interface ILoadedStratification {
  readonly rowIds: Range;
  readonly rows: string[];
  readonly range: CompositeRange1D;
}

export interface IStratificationLoader {
  (desc: IStratificationDataDescription): Promise<ILoadedStratification>;
}

function createRangeFromGroups(name: string, groups: any[]) {
  return composite(name, groups.map((g) => {
    return new Range1DGroup(g.name, g.color || 'gray', parse(g.range).dim(0));
  }));
}

function viaAPILoader(): IStratificationLoader {
  let _data: Promise<ILoadedStratification> = undefined;
  return (desc) => {
    if (!_data) { //in the cache
      _data = getAPIJSON('/dataset/' + desc.id).then((data) => {
        return {
          rowIds: parse(data.rowIds),
          rows: data.rows,
          range: createRangeFromGroups(desc.name, data.groups)
        };
      });
    }
    return _data;
  };
}

function viaDataLoader(rows: string[], rowIds: number[], range: CompositeRange1D): IStratificationLoader {
  let _data: Promise<ILoadedStratification> = undefined;
  return () => {
    if (!_data) { //in the cache
      _data = Promise.resolve({
        rowIds: rlist(rowIds),
        rows: rows,
        range: range
      });
    }
    return _data;
  };
}

/**
 * root matrix implementation holding the data
 */
export class Stratification extends DataTypeBase implements IStratification {
  private _v: Promise<IVector>;

  constructor(public readonly desc: IStratificationDataDescription, private loader: IStratificationLoader) {
    super(desc);
  }

  get idtype() {
    return resolveIDType(desc.idtype);
  }

  get groups() {
    return this.desc.groups;
  }

  group(group: number): IStratification {
    return new StratificationGroup(this, group, this.groups[group]);
  }

  hist(bins?: number, range?: Range): Promise<IHistogram> {
    //TODO
    return this.range().then((r) => {
      return rangeHist(r);
    });
  }

  vector(): Promise<IVector> {
    if (!this._v) {
      this._v = this.loader(this.desc).then((data) => new StratificationVector(this, data.range, this.desc));
    }
    return this._v;
  }

  origin(): Promise<IDataType> {
    if ('origin' in this.desc) {
      return getFirstByFQName(this.desc.origin);
    }
    return Promise.reject('no origin specified');
  }

  range() {
    return this.loader(this.desc).then((data) => data.range);
  }

  idRange() {
    return this.loader(this.desc).then((data) => {
      const ids = data.rowIds.dim(0);
      const range = data.range;
      return ids.preMultiply(range, that.dim[0]);
    });
  }

  names(range: Range = all()) {
    return this.loader(this.desc).then((data) => range.filter(data.rows, that.dim));
  }

  ids(range: Range = all()): Promise<Range> {
    return this.loader(this.desc).then((data) => data.rowIds.preMultiply(range, that.dim));
  }

  get idtypes() {
    return [this.idtype];
  }

  size() {
    return this.desc.size;
  }

  get length() {
    return this.size()[0];
  }

  get ngroups() {
    return this.desc.ngroups;
  }

  get dim() {
    return this.size();
  }

  persist() {
    return this.desc.id;
  }
}

/**
 * root matrix implementation holding the data
 */
export class StratificationVector extends VectorBase implements IVector {
  readonly valuetype: ICategoricalValueTypeDesc;
  readonly desc: IVectorDataDescription;

  private _cache: string[] = null;

  constructor(private strat: Stratification, private range: CompositeRange1D, desc: IDataDescription) {
    super(null);
    this._root = this;
    this.valuetype = {
      type: VALUE_TYPE_CATEGORICAL,
      categories: range.groups.map((g) => ({name: g.name, label: g.name, color: g.color}))
    };
    this.desc = {
      name: desc.name,
      fqname: desc.fqname,
      id: desc.id,
      type: 'vector',
      value: this.valuetype
    };
  }

  get idtype() {
    return this.strat.idtype;
  }

  get idtypes() {
    return [this.idtype];
  }

  persist() {
    return {
      root: this.strat.persist()
    };
  }

  restore(persisted: any) {
    let r: IVector = this;
    if (persisted && persisted.range) { //some view onto it
      r = r.view(parse(persisted.range));
    }
    return r;
  }

  private load(): string[] {
    if (!this._cache) {
      const r: string[] = [];
      this.range.groups.forEach((g) => {
        g.forEach(() => r.push(g.name));
      });
      this._cache = r;
    }
    return this._cache;
  }

  /**
   * access at a specific position
   * @param i
   * @returns {*}
   */
  at(i) {
    return Promise.resolve(this.load()[i]);
  }

  data(range: Range = all()) {
    const data = this.load();
    return Promise.resolve(range.filter(data, that.dim));
  }

  names(range: Range = all()) {
    return this.strat.names(range);
  }

  ids(range: Range = all()) {
    return this.strat.ids(range);
  }

  size() {
    return this.strat.size();
  }

  sort(compareFn?: (a: any, b: any) => number, thisArg?: any): Promise<IVector> {
    return this.data().then((d) => {
      const indices = argSort(d, compareFn, thisArg);
      return this.view(rlist(indices));
    });
  }

  map<U>(callbackfn: (value: any, index: number) => U, thisArg?: any): Promise<IVector> {
    //FIXME
    return null;
  }

  filter(callbackfn: (value: any, index: number) => boolean, thisArg?: any): Promise<IVector> {
    return this.data().then((d) => {
      const indices = argFilter(d, callbackfn, thisArg);
      return this.view(rlist(indices));
    });
  }
}

/**
 * module entry point for creating a datatype
 * @param desc
 * @returns {IVector}
 */
export function create(desc: IDataDescription): Stratification {
  return new Stratification(desc, viaAPILoader());
}

export function wrap(desc: IDataDescription, rows: string[], rowIds: number[], range: CompositeRange1D) {
  return new Stratification(desc, viaDataLoader(rows, rowIds, range));
}


export function wrapCategoricalVector(v: IVector) {
  if (v.valuetype.type !== VALUE_TYPE_CATEGORICAL) {
    throw new Error('invalid vector value type: ' + v.valuetype.type);
  }
  const desc: IStratificationDataDescription = {
    id: v.desc.id + '-s',
    type: 'stratification',
    name: v.desc.name + '-s',
    fqname: v.desc.fqname + '-s',
    ngroups: (<ICategoricalValueTypeDesc>v.desc.value).categories.length,
    size: v.dim
  };

  function loader() {
    return Promise.all<any>([v.groups(), v.ids(), v.names()]).then((args) => {
      return {
        range: args[0],
        rowIds: args[1],
        rows: args[2]
      };
    });
  }

  return new Stratification(desc, loader);
}
