/**
 * Created by Samuel Gratzl on 27.12.2016.
 */

import Range1D from './Range1D';
import CompositeRange1D from './CompositeRange1D';
import Range1DGroup from './Range1DGroup';
import {all, default as Range, none} from './Range';
import parseRange from './parser';
export {default as Range, all, none} from './Range';
export {default as Range1D} from './Range1D';
export {default as CompositeRange1D} from './CompositeRange1D';
export {default as Range1DGroup} from './Range1DGroup';

export function asUngrouped(range: Range1D) {
  return new Range1DGroup('unnamed', 'gray', range);
}

export function composite(name: string, groups: Range1DGroup[]) {
  return new CompositeRange1D(name, groups);
}

/**
 * test if the given object is a range
 */
export function is(obj: any) {
  return obj instanceof Range;
}

export function range(from: number, to?: number, step?: number): Range;
export function range(...ranges: number[][]): Range;
export function range() {
  if (arguments.length === 0) {
    return all();
  }
  const r = new Range();
  if (Array.isArray(arguments[0])) { //array mode
    Array.from(arguments).forEach((arr: number[], i) => {
      if (arr.length === 0) {
        return;
      }
      r.dim(i).setSlice(arr[0], arr[1], arr[2]);
    });
  }
  if (typeof arguments[0] === 'number') { //single slice mode
    r.dim(0).setSlice(arguments[0], arguments[1], arguments[2]);
  }
  return r;
}
export function join(ranges: Range[]): Range;
export function join(...ranges: Range[]): Range;
export function join() {
  if (arguments.length === 0) {
    return all();
  }
  let ranges = arguments[0];
  if (!Array.isArray(ranges)) { //array mode
    ranges = Array.from(arguments);
  }
  return new Range(ranges.map((r: Range) => r.dim(0)));
}

export function list(...dimsOrIndicesOrIndexArray: (Range1D | number[] | number)[]): Range;
export function list(dims: Range1D[]): Range;
export function list(): Range {
  if (arguments.length === 0) {
    return all();
  }
  if (Array.isArray(arguments[0]) && arguments[0][0] instanceof Range1D) {
    return new Range(arguments[0]);
  } else if (Array.isArray(arguments[0])) { //array mode
    const r = new Range();
    Array.from(arguments).forEach((arr: any, i) => {
      if (arr instanceof Range1D) {
        r.dims[i] = arr;
      } else {
        r.dim(i).setList(arr);
      }
    });
    return r;
  } else if (typeof arguments[0] === 'number') { //single slice mode
    const r = new Range();
    r.dim(0).setList(Array.from(arguments));
    return r;
  } else if (arguments[0] instanceof Range1D) {
    return new Range(Array.from(arguments));
  }
  return none();
}


/**
 * something that can be parsed as a range
 */
export type RangeLike = Range | number[] | number[][] | string;

/**
 * parses the given encoded string created by toString to a range object
 * @param arange something like a range
 * @returns {Range}
 */
export function parse(arange: RangeLike = null) {

  if (arange === null) {
    return all();
  }
  if (arange instanceof Range) {
    return <Range>arange;
  }
  if (Array.isArray(arange)) {
    if (Array.isArray(arange[0])) {
      return list(...<number[][]>arange);
    }
    return list(<number[]>arange);
  }
  //join given array as string combined with ,
  return parseRange(Array.from(arguments).map(String).join(','));
}

export function cell(...dimIndices: number[]) {
  return new Range(dimIndices.map(Range1D.single));
}
