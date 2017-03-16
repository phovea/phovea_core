/**
 * Created by Samuel Gratzl on 16.03.2017.
 */
import {IAnyVector} from '../';
import {RangeLike, all} from '../../range';
import ANameVector, {IStringVector} from './ANameVector';

export default class VectorNameVector extends ANameVector<IAnyVector> implements IStringVector {

  constructor(vector: IAnyVector) {
    super(vector);
    this.root = this;
  }

  get idtype() {
    return this.base.idtype;
  }

  names(range: RangeLike = all()) {
    return this.base.names(range);
  }

  ids(range: RangeLike = all()) {
    return this.base.ids(range);
  }

  size() {
    return this.base.length;
  }
}
