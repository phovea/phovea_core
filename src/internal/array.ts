/**
 * Created by Samuel Gratzl on 27.12.2016.
 */

/**
 * search item in array by function
 * @param arr
 * @param f
 * @deprecated use Array.prototype.find
 * @return {T}
 */
export function search<T>(arr: T[], f: (v: T) => boolean): T | undefined {
  let r: T | undefined = undefined;
  arr.some((v) => {
    if (f(v)) {
      r = v;
      return true;
    }
    return false;
  });
  return r;
}

/**
 *
 * @deprecated use Array.prototype.findIndex
 * @param arr
 * @param f
 * @return {number}
 */
export function indexOf<T>(arr: T[], f: (v: T) => boolean): number {
  let r = -1;
  arr.some((v, i) => {
    if (f(v)) {
      r = i;
      return true;
    }
    return false;
  });
  return r;
}

/**
 * array with indices of 0...n-1
 * @param n
 * @returns {any[]}
 */
function indexRange(n: number): number[] {
  // https://stackoverflow.com/a/38213213
  return Array.from({length: n}, (_, k) => k);
}

/**
 * returns the sorted indices of this array, when sorting by the given function
 * @param arr
 * @param compareFn
 * @param thisArg
 */
export function argSort<T>(arr: T[], compareFn?: (a: T, b: T) => number, thisArg?: any): number[] {
  const indices = indexRange(arr.length);
  return indices.sort((a: any, b: any) => {
    const av = arr[a];
    const bv = arr[b];
    return compareFn ? compareFn.call(thisArg, av, bv) : (av < bv ? -1 : (bv > av ? 1 : 0));
  });
}


/**
 * returns the indices, which remain when filtering the given array
 * @param arr
 * @param callbackfn
 * @param thisArg
 */
export function argFilter<T>(arr: T[], callbackfn: (value: T, index: number) => boolean, thisArg?: any): number[] {
  const indices = indexRange(arr.length);
  return indices.filter((value: number, index: number) => {
    return callbackfn.call(thisArg, arr[value], index);
  });
}
