/**
 * Created by Samuel Gratzl on 16.03.2017.
 */
import {IAnyMatrix} from '../';
import {RangeLike, all} from '../../range';
import ANameVector, {IStringVector} from '../../vector/internal/ANameVector';

export default class MatrixColumnNameVector extends ANameVector<IAnyMatrix> implements IStringVector {

  constructor(matrix: IAnyMatrix) {
    super(matrix);
    this.root = this;
  }

  get idtype() {
    return this.base.coltype;
  }

  names(range: RangeLike = all()) {
    return this.base.cols(range);
  }

  ids(range: RangeLike = all()) {
    return this.base.colIds(range);
  }

  size() {
    return this.base.ncol;
  }
}
