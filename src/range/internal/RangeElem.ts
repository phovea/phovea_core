/**
 * Created by Samuel Gratzl on 27.12.2016.
 */

import {IRangeElem, fix} from './index';
import {range as iRange, IIterator} from '../../iterator';
import SingleRangeElem from './SingleRangeElem';

export default class RangeElem implements IRangeElem {
  constructor(public readonly from: number, public readonly to: number = -1, public readonly step: number = 1) {
    /*if (step !== 1 && step !== -1) {
     throw new Error('currently just +1 and -1 are valid steps');
     }*/
  }

  get isAll() {
    return this.from === 0 && this.to === -1 && this.step === 1;
  }

  get isSingle() {
    return (this.from + this.step) === this.to;
  }

  get isUnbound() {
    return this.from < 0 || this.to < 0;
  }

  static all() {
    return new RangeElem(0, -1, 1);
  }

  static none() {
    return new RangeElem(0, 0, 1);
  }

  static single(val: number) {
    return new SingleRangeElem(val);
  }

  static range(from: number, to = -1, step = 1) {
    if ((from + step) === to) {
      return RangeElem.single(from);
    }
    return new RangeElem(from, to, step);
  }

  size(size?: number): number {
    const t = fix(this.to, size), f = fix(this.from, size);
    if (this.step === 1) {
      return Math.max(t - f, 0);
    } else if (this.step === -1) {
      return Math.max(f - t, 0);
    }
    const d = this.step > 0 ? (t - f + 1) : (f - t + 1);
    const s = Math.abs(this.step);
    if (d <= 0) { //no range
      return 0;
    }
    return Math.floor(d / s);
  }

  clone() {
    return new RangeElem(this.from, this.to, this.step);
  }

  reverse() {
    const t = this.from < 0 ? this.from : this.from + 1;
    const f = this.to < 0 ? this.to : this.to - 1;
    return new RangeElem(f, t, -this.step);
  }

  invert(index: number, size?: number) {
    if (this.isAll) {
      return index;
    }
    return fix(this.from, size) + index * this.step;
  }

  /**
   * creates an iterator of this range
   * @param size the underlying size for negative indices
   */
  iter(size?: number): IIterator<number> {
    return iRange(fix(this.from, size), fix(this.to, size), this.step);
  }

  get __iterator__() {
    return this.iter();
  }

  contains(value: number, size?: number) {
    const f = fix(this.from, size);
    const t = fix(this.to, size);
    if (this.step === -1) {
      return (value <= f) && (value > t);
    } else { //+1
      return (value >= f) && (value < t);
    }
  }

  toString() {
    if (this.isAll) {
      return '';
    }
    if (this.isSingle) {
      return this.from.toString();
    }
    let r = this.from + ':' + this.to;
    if (this.step !== 1) {
      r += ':' + this.step;
    }
    return r;
  }

  static parse(code: string) {
    if (code.length === 0) {
      return RangeElem.all();
    }
    const parts = code.split(':');
    if (parts.length === 1) {
      return RangeElem.single(parseFloat(parts[0]));
    } else if (parts.length === 2) {
      return new RangeElem(parseFloat(parts[0]), parseFloat(parts[1]));
    }
    return new RangeElem(parseFloat(parts[0]), parseFloat(parts[1]), parseFloat(parts[2]));
  }
}

