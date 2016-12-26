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
import {parse, Range1DGroup, RangeLike, composite, Range, list as rlist, CompositeRange1D, all} from './range';
import {resolve as resolveIDType} from './idtype';
import {
  ADataType, IDataType, ICategoricalValueTypeDesc,
  VALUE_TYPE_CATEGORICAL, IValueType, ICategory
} from './datatype';
import {getFirstByFQName} from './data';
import {IVector, IVectorDataDescription} from './vector';
import {AVector} from './vector_impl';
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
export class Stratification extends ADataType<IStratificationDataDescription> implements IStratification {
  private _v: Promise<IVector>;

  constructor(desc: IStratificationDataDescription, private loader: IStratificationLoader) {
    super(desc);
  }

  get idtype() {
    return resolveIDType(this.desc.idtype);
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

  vector() {
    return this.asVector();
  }

  asVector(): Promise<IVector> {
    if (!this._v) {
      this._v = this.loader(this.desc).then((data) => new StratificationVector(this, data.range));
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
      return ids.preMultiply(range, this.dim[0]);
    });
  }

  names(range: RangeLike = all()) {
    return this.loader(this.desc).then((data) => parse(range).filter(data.rows, this.dim));
  }

  ids(range: RangeLike = all()): Promise<Range> {
    return this.loader(this.desc).then((data) => data.rowIds.preMultiply(parse(range), this.dim));
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
    return [this.size()];
  }

  persist() {
    return this.desc.id;
  }
}

/**
 * root matrix implementation holding the data
 */
export class StratificationVector extends AVector implements IVector {
  readonly valuetype: ICategoricalValueTypeDesc;
  readonly desc: IVectorDataDescription;

  private _cache: string[] = null;

  constructor(private strat: Stratification, private range: CompositeRange1D) {
    super(null);
    this.root = this;
    this.valuetype = {
      type: <any>VALUE_TYPE_CATEGORICAL,
      categories: range.groups.map((g) => ({name: g.name, label: g.name, color: g.color}))
    };
    const d = strat.desc;
    this.desc = {
      name: d.name,
      fqname: d.fqname,
      description: d.description,
      id: d.id + '-v',
      type: 'vector',
      size: d.size,
      idtype: d.idtype,
      value: this.valuetype,
      creator: d.creator,
      ts: d.ts
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

  data(range: RangeLike = all()) {
    const data = this.load();
    return Promise.resolve(parse(range).filter(data, this.dim));
  }

  names(range: RangeLike = all()) {
    return this.strat.names(range);
  }

  ids(range: RangeLike = all()) {
    return this.strat.ids(range);
  }

  size() {
    return this.strat.size();
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
 * @returns {IVector}
 */
export function create(desc: IStratificationDataDescription): Stratification {
  return new Stratification(desc, viaAPILoader());
}

export function wrap(desc: IStratificationDataDescription, rows: string[], rowIds: number[], range: CompositeRange1D) {
  return new Stratification(desc, viaDataLoader(rows, rowIds, range));
}


export function wrapCategoricalVector(v: IVector) {
  if (v.valuetype.type !== VALUE_TYPE_CATEGORICAL) {
    throw new Error('invalid vector value type: ' + v.valuetype.type);
  }
  const toGroup = (g: string|ICategory) => {
    if (typeof g === 'string') {
      return {name: <string>g, color: 'gray', size: NaN};
    }
    const cat = <ICategory>g;
    return {name: cat.name, color: cat.color || 'gray', size: NaN};
  };
  const cats = (<ICategoricalValueTypeDesc>v.desc.value).categories.map(toGroup);
  const desc: IStratificationDataDescription = {
    id: v.desc.id + '-s',
    type: 'stratification',
    name: v.desc.name + '-s',
    fqname: v.desc.fqname + '-s',
    description: v.desc.description,
    idtype: v.idtype,
    ngroups: cats.length,
    groups: cats,
    size: v.length,
    creator: v.desc.creator,
    ts: v.desc.ts
  };

  function loader() {
    return Promise.all<any>([v.groups(), v.ids(), v.names()]).then((args) => {
      const range = <CompositeRange1D>args[0];
      range.groups.forEach((g, i) => cats[i].size = g.length);
      return {
        range: args[0],
        rowIds: args[1],
        rows: args[2]
      };
    });
  }

  return new Stratification(desc, loader);
}
