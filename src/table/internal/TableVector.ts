/**
 * Created by Samuel Gratzl on 27.12.2016.
 */

import {argFilter, argSort} from '../../index';
import {all, parse, RangeLike, list as rlist} from '../../range';
import {IValueType} from '../../datatype';
import {IVector, IVectorDataDescription} from '../../vector';
import {ITableColumn} from '../ITable';
import Table from '../Table';
import AVector from '../../vector/AVector';

/**
 * root matrix implementation holding the data
 */
export default class TableVector extends AVector implements IVector {
  readonly desc: IVectorDataDescription;
  readonly column: string;

  constructor(private table: Table, private index: number, desc: ITableColumn) {
    super(null);
    this.column = desc.name;
    this.root = this;
    this.desc = {
      type: 'vector',
      id: table.desc.id + '_' + desc.name,
      name: desc.name,
      description: desc.description || '',
      fqname: table.desc.fqname + '/' + desc.name,
      idtype: table.idtype.id,
      size: table.nrow,
      value: desc.value,
      creator: table.desc.creator,
      ts: table.desc.ts
    };
  }

  get valuetype() {
    return this.desc.value;
  }

  get idtype() {
    return this.table.idtype;
  }

  get idtypes() {
    return [this.idtype];
  }

  persist() {
    return {
      root: this.table.persist(),
      col: this.index
    };
  }

  restore(persisted: any) {
    let r: IVector = this;
    if (persisted && persisted.range) { //some view onto it
      r = r.view(parse(persisted.range));
    }
    return r;
  }

  /**
   * access at a specific position
   * @param i
   * @returns {*}
   */
  at(i: number) {
    return this.table.at(i, this.index);
  }

  data(range: RangeLike = all()) {
    return this.table.colData(this.column, range);
  }

  names(range: RangeLike = all()) {
    return this.table.rows(range);
  }

  ids(range: RangeLike = all()) {
    return this.table.rowIds(range);
  }

  size() {
    return this.table.nrow;
  }

  sort(compareFn?: (a: IValueType, b: IValueType) => number, thisArg?: any): Promise<IVector> {
    return this.data().then((d) => {
      let indices = argSort(d, compareFn, thisArg);
      return this.view(rlist(indices));
    });
  }

  filter(callbackfn: (value: IValueType, index: number) => boolean, thisArg?: any): Promise<IVector> {
    return this.data().then((d) => {
      let indices = argFilter(d, callbackfn, thisArg);
      return this.view(rlist(indices));
    });
  }
}

