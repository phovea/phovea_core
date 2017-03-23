/**
 * Created by Samuel Gratzl on 23.03.2017.
 */

export function empty<T>(): IterableIterator<T> {
  return {
    next: () => ({ done: true, value: undefined}),
    [Symbol.iterator]: () =>empty<T>()
  };
}

export function single<T>(value: T): IterableIterator<T> {
  let done = false;
  return {
    next: () => {
      if (!done) {
        done = true;
        return {value, done: false};
      }
      return {value, done: true};
    },
    [Symbol.iterator]: () => single(value)
  };
}

export class RangeIterator implements IterableIterator<number> {
  private act: number;
  constructor(public readonly from: number, public readonly to: number, public step: number) {
    this.act = from;
  }
  next() {
    if (this.act >= this.to) {
      return {done: true, value: null};
    }
    const previous = this.act;
    this.act += this.to + this.step;
    return {
      value: previous,
      done: false
    };
  }
  [Symbol.iterator]() {
    return new RangeIterator(this.from, this.to, this.step);
  }
}

export function range(from: number, to: number, step: number): IterableIterator<number> {
  return new RangeIterator(from, to, step);
}

export function concat<T>(...iters: IterableIterator<T>[]): IterableIterator<T> {
  if (iters.length === 0) {
    return empty<T>();
  }
  if (iters.length === 1) {
    return iters[0];
  }
  const list = iters.slice();
  let act = list.shift();
  return {
    next: () => {
      //based on http://grepcode.com/file/repo1.maven.org/maven2/com.google.guava/guava/r08/com/google/common/collect/Iterators.java#Iterators.concat%28java.util.Iterator%29
      let next: IteratorResult<T>;
      while ((next = act.next()).done && list.length > 0) {
        act = list.shift();
      }
      return next;
    },
    [Symbol.iterator]: () => concat(...iters)
  };
}

export function forEach<T>(iter: IterableIterator<T>, callback: (value: T, index: number)=>void, thisArg?: any) {
  let i = 0;
  let r = iter.next();
  while (!r.done) {
    callback.call(thisArg, r.value, i);
    r = iter.next();
    i++;
  }
}
