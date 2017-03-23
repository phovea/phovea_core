/**
 * Created by Samuel Gratzl on 27.12.2016.
 */


/**
 * fix negative indices given the total size
 * @param v
 * @param size
 * @returns {number}
 */
export interface IRangeElem extends Iterable<number> {
  readonly isAll: boolean;
  readonly isUnbound: boolean;
  readonly isSingle: boolean;
  size(size?: number): number;
  clone(): IRangeElem;
  invert(index: number, size?: number): number;
  iter(size?: number): IterableIterator<number>;
  toString(): string;
  readonly from: number;
  readonly step: number;
  readonly to: number;
  reverse(): IRangeElem;
  contains(value: number, size?: number): boolean;
}

export function fix(v: number, size: number) {
  return v < 0 ? (size + 1 + v) : v;
}
