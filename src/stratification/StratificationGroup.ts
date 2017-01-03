/**
 * Created by sam on 26.12.2016.
 */


import {Range, RangeLike, CompositeRange1D, all, list, Range1DGroup, parse} from '../range';
import {IDataType} from '../datatype';
import {SelectAble} from '../idtype';
import {ICategoricalVector} from '../vector';
import {IHistogram, rangeHist} from '../math';
import {IStratification, IGroup} from './IStratification';

/**
 * root matrix implementation holding the data
 */
export default class StratificationGroup extends SelectAble implements IStratification {
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

  vector() {
    return this.asVector();
  }

  asVector(): Promise<ICategoricalVector> {
    return Promise.all<any>([this.root.asVector(), this.rangeGroup()]).then((arr: [ICategoricalVector, Range1DGroup]) => arr[0].view(list(arr[1])));
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
