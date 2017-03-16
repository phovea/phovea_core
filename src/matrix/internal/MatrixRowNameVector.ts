/**
 * Created by Samuel Gratzl on 16.03.2017.
 */
import {IAnyMatrix} from '../';
import {RangeLike, all} from '../../range';
import ANameVector, {IStringVector} from '../../vector/internal/ANameVector';

export default class MatrixRowNameVector extends ANameVector<IAnyMatrix> implements IStringVector {

  constructor(matrix: IAnyMatrix) {
    super(matrix);
    this.root = this;
  }

  get idtype() {
    return this.base.rowtype;
  }

  names(range: RangeLike = all()) {
    return this.base.rows(range);
  }

  ids(range: RangeLike = all()) {
    return this.base.rowIds(range);
  }

  size() {
    return this.base.nrow;
  }

  persist() {
    return {
      root: this.base.persist(),
      names: 'row'
    };
  }
}
