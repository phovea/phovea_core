/**
 * Created by Samuel Gratzl on 27.12.2016.
 */

import {fixId, argFilter, argSort} from '../../index';
import {parse, RangeLike, list as rlist} from '../../range';
import {IValueTypeDesc, IValueType} from '../../datatype';
import {IVector, IVectorDataDescription} from '../../vector';
import {ITable} from '../ITable';
import AVector from '../../vector/AVector';

export default class MultiTableVector extends AVector implements IVector {
  readonly desc: IVectorDataDescription;

  constructor(private table: ITable, private f: (row: IValueType[]) => IValueType, private this_f = table, public readonly valuetype: IValueTypeDesc = null, private _idtype = table.idtype) {
    super(null);
    this.desc = {
      name: table.desc.name + '-p',
      fqname: table.desc.fqname + '-p',
      description: f.toString(),
      type: 'vector',
      id: fixId(table.desc.id + '-p' + f.toString()),
      idtype: table.desc.idtype,
      size: table.nrow,
      value: valuetype,
      creator: table.desc.creator,
      ts: Date.now()
    };
    this.root = this;
  }

  get idtype() {
    return this._idtype;
  }

  get idtypes() {
    return [this.idtype];
  }

  persist() {
    return {
      root: this.table.persist(),
      f: this.f.toString(),
      valuetype: this.valuetype ? this.valuetype : undefined,
      idtype: this.idtype === this.table.idtype ? undefined : this.idtype.name
    };
  }

  restore(persisted: any) {
    let r: IVector = this;
    if (persisted && persisted.range) { //some view onto it
      r = r.view(parse(persisted.range));
    }
    return r;
  }

  size() {
    return this.table.nrow;
  }

  /**
   * return the associated ids of this vector
   */
  names(range?: RangeLike): Promise<string[]> {
    return this.table.rows(range);
  }

  ids(range?: RangeLike) {
    return this.table.rowIds(range);
  }

  /**
   * returns a promise for getting one cell
   * @param i
   */
  at(i: number): Promise<any> {
    return this.table.data(rlist(i)).then((d) => {
      return this.f.call(this.this_f, d[0]);
    });
  }

  /**
   * returns a promise for getting the data as two dimensional array
   * @param range
   */
  data(range?: RangeLike): Promise<IValueType[]> {
    return this.table.data(range).then((d) => {
      return d.map(this.f, this.this_f);
    });
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
