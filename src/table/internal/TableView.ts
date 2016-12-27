/**
 * Created by Samuel Gratzl on 27.12.2016.
 */
import {all, parse, RangeLike, Range} from '../../range';
import {ITable} from '../ITable';
import ATable from '../ATable';

/**
 * view on the vector restricted by a range
 * @param root underlying matrix
 * @param range range selection
 * @param t optional its transposed version
 * @constructor
 */
export default class TableView extends ATable implements ITable {
  constructor(root: ITable, private range: Range) {
    super(root);
    this.range = range;
  }

  get desc() {
    return this.root.desc;
  }

  persist() {
    return {
      root: this.root.persist(),
      range: this.range.toString()
    };
  }

  restore(persisted: any) {
    let r: ITable = this;
    if (persisted && persisted.range) { //some view onto it
      r = r.view(parse(persisted.range));
    }
    return r;
  }

  size() {
    return this.range.size(this.root.dim);
  }

  at(i: number, j: number) {
    let inverted = this.range.invert([i, j], this.root.dim);
    return this.root.at(inverted[0], inverted[1]);
  }

  col(i: number) {
    let inverted = this.range.invert([0, i], this.root.dim);
    return this.root.col(inverted[1]);
  }

  cols(range: RangeLike = all()) {
    return this.root.cols(this.range.swap().preMultiply(parse(range), this.root.dim));
  }

  data(range: RangeLike = all()) {
    return this.root.data(this.range.preMultiply(parse(range), this.root.dim));
  }

  objects(range: RangeLike = all()) {
    return this.root.objects(this.range.preMultiply(parse(range), this.root.dim));
  }

  rows(range: RangeLike = all()) {
    return this.root.rows(this.range.preMultiply(parse(range), this.root.dim));
  }

  rowIds(range: RangeLike = all()) {
    return this.root.rowIds(this.range.preMultiply(parse(range), this.root.dim));
  }

  ids(range: RangeLike = all()) {
    return this.rowIds(range);
  }

  view(range: RangeLike = all()) {
    const r = parse(range);
    if (r.isAll) {
      return this;
    }
    return new TableView(this.root, this.range.preMultiply(r, this.dim));
  }

  get idtype() {
    return this.root.idtype;
  }

  get idtypes() {
    return [this.idtype];
  }

  queryView(name: string, args: any): ITable {
    throw new Error('not implemented');
  }
}
