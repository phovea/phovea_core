/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */

'use strict';
import * as ranges from './range';
import * as datatypes from './datatype';
import * as idtypes from './idtype';
import * as vector from './vector';
import * as math from './math';

export interface IGroup {
  name: string;
  size: number;
  color: string;
}

export function guessColor(stratification: string, group: string) {
  switch(group.toLowerCase()) {
    case 'male': return 'blue';
    case 'female': return 'red';
    case 'deceased': return '#e41a1b';
    case 'living': return '#377eb8';
  }
  return 'gray';
}

export interface IStratification extends datatypes.IDataType {
  range() : Promise<ranges.CompositeRange1D>;
  idRange(): Promise<ranges.CompositeRange1D>;
  vector(): Promise<vector.IVector>;

  names();
  names(range:ranges.Range);

  ids(): Promise<ranges.Range>;
  ids(range:ranges.Range): Promise<ranges.Range>;

  hist(bins? : number, range?:ranges.Range): Promise<math.IHistogram>;

  length: number;
  ngroups: number;

  groups: IGroup[];

  idtype: idtypes.IDType;

  group(group: number): IStratification;

  origin(): Promise<datatypes.IDataType>;
}


/**
 * root matrix implementation holding the data
 */
export class StratificationGroup extends idtypes.SelectAble implements IStratification {
  constructor(private root:IStratification, private groupIndex:number, private groupDesc:IGroup) {
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

  group(groupIndex:number): IStratification {
    if (groupIndex === 0) {
      return this;
    }
    return null; //can't sub a single group
  }

  get idtype() {
    return this.root.idtype;
  }

  hist(bins?:number, range = ranges.all()):Promise<math.IHistogram> {
    //TODO
    return this.range().then((r) => {
      return math.rangeHist(r);
    });
  }

  vector():Promise<vector.IVector> {
    return Promise.all<any>([this.root.vector(), this.rangeGroup()]).then((arr:[vector.IVector, ranges.Range1DGroup]) => arr[0].view(ranges.list(arr[1])));
  }

  origin():Promise<datatypes.IDataType> {
    return this.root.origin();
  }

  range() {
    return this.rangeGroup().then((g) => {
      return new ranges.CompositeRange1D(g.name, [g]);
    });
  }

  idRange() {
    return this.root.idRange().then((r) => {
      const g = r.groups[this.groupIndex];
      return new ranges.CompositeRange1D(g.name, [g]);
    });
  }

  rangeGroup() {
    return this.root.range().then((r) => {
      return r.groups[this.groupIndex];
    });
  }

  names(range:ranges.Range = ranges.all()) {
    return this.rangeGroup().then((g) => {
      var r = ranges.list(g).preMultiply(range);
      return this.root.names(r);
    });
  }

  ids(range:ranges.Range = ranges.all()):Promise<ranges.Range> {
    return this.rangeGroup().then((g) => {
      var r = ranges.list(g).preMultiply(range);
      return this.root.ids(r);
    });
  }

  idView(idRange:ranges.Range = ranges.all()):Promise<IStratification> {
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

  restore(persisted:any) {
    return this;
  }
}
