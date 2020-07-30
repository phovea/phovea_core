/**
 * Created by Samuel Gratzl on 29.08.2014.
 */
export interface IIterable<T> {
    forEach(callbackfn: (value: T) => void, thisArg?: any): void;
}
