/**
 * similar to Promise.resolve but executes the result immediately without an intermediate tick
 * @param {PromiseLike<T> | T} result
 * @returns {PromiseLike<T>}
 */
export function resolveImmediately<T>(result: T | PromiseLike<T>): PromiseLike<T> {
  if (result instanceof Promise || (result && typeof (<any>result).then === 'function')) {
    return <PromiseLike<T>>result;
  }
  return new ResolveNow(result);
}

class ResolveNow<T> implements PromiseLike<T> {
  constructor(private readonly v: T) {
  }

  then<TResult1, TResult2>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null): PromiseLike<TResult1 | TResult2> {
    return resolveImmediately(onfulfilled(this.v));
  }
}
