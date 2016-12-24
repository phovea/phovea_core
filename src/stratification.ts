/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */

import {Range, RangeLike, CompositeRange1D, all, list, Range1DGroup, parse} from './range';
import {IDataType, IDataDescription} from './datatype';
import {IDType, SelectAble} from './idtype';
import {IVector} from './vector';
import {IHistogram, rangeHist} from './math';

export interface IGroup {
  readonly name: string;
  readonly color: string;
  readonly size: number;
}

export function guessColor(stratification: string, group: string) {
  switch (group.toLowerCase()) {
    case 'male':
      return 'blue';
    case 'female':
      return 'red';
    case 'deceased':
      return '#e41a1b';
    case 'living':
      return '#377eb8';
  }
  return 'gray';
}

export interface IStratificationDataDescription extends IDataDescription {
  readonly idtype: IDType;
  readonly size: number;
  readonly groups: IGroup[];
  readonly ngroups: number;
  /**
   * fqname of the origin dataset, e.g. vector, table
   */
  readonly origin?: string;
}

export interface IStratification extends IDataType {
  readonly desc: IStratificationDataDescription;
  range(): Promise<CompositeRange1D>;
  idRange(): Promise<CompositeRange1D>;
  vector(): Promise<IVector>;

  names();
  names(range: RangeLike);

  ids(): Promise<Range>;
  ids(range: RangeLike): Promise<Range>;

  hist(bins?: number, range?: RangeLike): Promise<IHistogram>;

  readonly length: number;
  readonly ngroups: number;

  readonly groups: IGroup[];

  readonly idtype: IDType;

  group(group: number): IStratification;

  origin(): Promise<IDataType>;
}
export default IStratification;


/**
 * root matrix implementation holding the data
 */
export class StratificationGroup extends SelectAble implements IStratification {
  constructor(private root: IStratification, private groupIndex: number, private groupDesc: IGroup) {
    super();
  }

  get desc() {
    return this.root.desc;
  }

  get groups() {
    return [this.groupDesc];
  }

  get ngroups() {
    return 1;
  }

  group(groupIndex: number): IStratification {
    if (groupIndex === 0) {
      return this;
    }
    return null; //can't sub a single group
  }

  get idtype() {
    return this.root.idtype;
  }

  hist(bins?: number, range: RangeLike = all()): Promise<IHistogram> {
    //FIXME
    return this.range().then((r) => {
      return rangeHist(r);
    });
  }

  vector(): Promise<IVector> {
    return Promise.all<any>([this.root.vector(), this.rangeGroup()]).then((arr: [IVector, Range1DGroup]) => arr[0].view(list(arr[1])));
  }

  origin(): Promise<IDataType> {
    return this.root.origin();
  }

  range() {
    return this.rangeGroup().then((g) => {
      return new CompositeRange1D(g.name, [g]);
    });
  }

  idRange() {
    return this.root.idRange().then((r) => {
      const g = r.groups[this.groupIndex];
      return new CompositeRange1D(g.name, [g]);
    });
  }

  rangeGroup() {
    return this.root.range().then((r) => {
      return r.groups[this.groupIndex];
    });
  }

  names(range: RangeLike = all()) {
    return this.rangeGroup().then((g) => {
      const r = list(g).preMultiply(parse(range));
      return this.root.names(r);
    });
  }

  ids(range: RangeLike = all()): Promise<Range> {
    return this.rangeGroup().then((g) => {
      const r = list(g).preMultiply(parse(range));
      return this.root.ids(r);
    });
  }

  idView(idRange: RangeLike = all()): Promise<any> {
    return Promise.reject('not implemented');
  }

  toString() {
    return this.persist();
  }

  get idtypes() {
    return [this.idtype];
  }

  size() {
    return [this.length];
  }

  get length() {
    return this.groupDesc.size;
  }

  get dim() {
    return this.size();
  }

  persist() {
    return {
      root: this.root.persist(),
      group: this.groupIndex
    };
  }

  restore(persisted: any) {
    return this;
  }
}
