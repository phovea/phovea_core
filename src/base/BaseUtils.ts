/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */

import {__extends} from 'tslib';
import {IIterable} from './IIterable';


export class BaseUtils {
  /**
   * integrate b into a and override all duplicates
   * @param {Object} a
   * @param {Object} bs
   * @returns {Object} a with extended b
   */
  static mixin<T, U>(a: T, b: U, ...bs: any[]): T & U {
    bs.unshift(b);
    function extend(r: any, b: any) {
      Object.keys(b).forEach((key) => {
        const v = b[key];
        if (Object.prototype.toString.call(v) === '[object Object]') {
          r[key] = (r[key] != null) ? extend(r[key], v) : v;
        } else {
          r[key] = v;
        }
      });
      return r;
    }

    bs.forEach((b) => {
      if (b) {
        a = extend(a, b);
      }
    });
    return <any>a;
  }

  /**
   * @deprecated use obj === undefined directly
   * @param obj
   * @return {boolean}
   */
  static isUndefined(obj: any) {
    return typeof obj === 'undefined';
  }


  //fixes a javascript bug on using "%" with negative numbers
  static mod(n: number, m: number) {
    return ((n % m) + m) % m;
  }

  /**
   * binds the given function to the given context / this arg
   * @deprecated use Function.prototype.bind directly
   * @param f
   * @param thisArg
   * @returns {function(): any}
   */
  static bind(f: () => any, thisArg: any, ...args: any[]) {
    return f.bind(thisArg, ...args);
  }

  /**
   * getter generator by name or index
   * @deprecated too simple to write
   */
  static getter(...attr: (number|string)[]) {
    if (attr.length === 1) {
      return (obj: any) => obj[attr[0]];
    }
    return (obj: any) => attr.map((a) => obj[a]);
  }

  /**
   * @deprecated use `typeof(f) === 'function`
   * @param f
   * @return {boolean}
   */
  static isFunction(f: any) {
    return typeof(f) === 'function';
  }

  /**
   * @deprecated use `(d) => d`
   * identity function
   */
  static identity(d: any) {
    return d;
  }

  /**
   * a dummy function, which does exactly nothing, i.e. used as default
   * @deprecated use `()=>undefined`
   */
  static noop() {
    //no op
  }

  /**
   * just returns the argument in any case
   * @deprecated use `() => x`
   * @param r - the value to return
   * @returns {*}
   */
  static constant(r: any) {
    if (typeof r === 'boolean' && r === true) {
      return BaseUtils.constantTrue;
    }
    if (typeof r === 'boolean' && r === false) {
      return BaseUtils.constantFalse;
    }
    return () => r;
  }

  /**
   * special constant function which returns always true, i.e., as a default for a filter function
   * @deprecated use ()=>true
   * @returns {boolean}
   */
  static constantTrue() {
    return true;
  }

  /**
   * special constant function which returns always false, i.e., as a default for a filter function
   * @deprecated use ()=>false
   * @returns {boolean}
   */
  static constantFalse() {
    return false;
  }

  /**
   * copies a plain object into a function and call a specific method onto direct call
   * @param obj - the
   * @param f
   * @deprecated
   */
  static callable(obj: any, f: string) {
    //assert this.isPlainObject(obj);
    function CallAbleFactory() {
      let that: any;

      function CallAble() {
        that[f].apply(that, Array.from(arguments));
      }

      that = CallAble;
      BaseUtils.mixin(CallAble, obj);
      return CallAble;
    }

    return CallAbleFactory;
  }

  /**
   * generates a random id of the given length
   * @param length length of the id
   * @returns {string}
   */
  static randomId(length = 8) {
    let id = '';
    while (id.length < length) {
      id += Math.random().toString(36).slice(-8);
    }
    return id.substr(0, length);
  }

  /**
   * fixes a given name by converting it to plain camelcase
   * @param name
   * @return {string}
   */
  static fixId(name: string) {
    const clean = name.replace(/[\s!#$%&'()*+,.\/:;<=>?@\[\\\]\^`{|}~_-]/g, ' ');
    const words = clean.trim().split(/\s+/); //remove heading and trailing spaces and combine multiple one during split
    return words.map((w, i) => (i === 0 ? w[0].toLowerCase() : w[0].toUpperCase()) + w.slice(1)).join('');
  }

  /**
   * extends class copied from TypeScript compiler
   * @param subClass
   * @param baseClass
   */
  static extendClass(subClass: any, baseClass: any) {
    __extends(subClass, baseClass);
  }


  /**
   * create a debounce call, can be called multiple times but only the last one at most delayed by timeToDelay will be executed
   * @param callback
   * @param timeToDelay
   * @return {function(...[any]): undefined}
   */
  static debounce(this: any, callback: () => void, timeToDelay = 100) {
    let tm = -1;
    return function(...args: any[]) {
      if (tm >= 0) {
        clearTimeout(tm);
        tm = -1;
      }
      args.unshift(this);
      tm = self.setTimeout(callback.bind.apply(callback, args), timeToDelay);
    };
  }

  /**
   * computes the absolute offset of the given element
   * @param element
   * @return {{left: number, top: number, width: number, height: number}}
   */
  static offset(element: Element) {
    if (!element) {
      return {left: 0, top: 0, width: 0, height: 0};
    }
    const obj = element.getBoundingClientRect();
    const w = element.ownerDocument.defaultView;
    return {
      left: obj.left + w.pageXOffset,
      top: obj.top + w.pageYOffset,
      width: obj.width,
      height: obj.height
    };
  }

  /**
   * returns the bounding box of a given element similar to offset
   * @param element
   * @returns {{x: number, y: number, w: number, h: number}}
   */
  static bounds(element: Element) {
    if (!element) {
      return {x: 0, y: 0, w: 0, h: 0};
    }
    const obj = element.getBoundingClientRect();
    return {
      x: obj.left,
      y: obj.top,
      w: obj.width,
      h: obj.height
    };
  }

  /**
   * returns a promise that resolves in the given number of milliseconds
   * @param milliseconds the number of milliseconds to resolve
   */
  static resolveIn(milliseconds: number): Promise<void> {
    if (milliseconds <= 0) {
      return Promise.resolve<void>(null);
    }
    return new Promise<void>((resolve) => {
      setTimeout(resolve, milliseconds);
    });
  }

  /**
   * computes the extent [min, max] for the given array, in case of empty array [NaN, NaN] is returned
   * @param arr the array
   * @return {[number,number]} [min, max]
   */
  static extent(arr: IIterable<number>): [number, number] {
    let min = NaN, max = NaN;
    arr.forEach((v) => {
      if (isNaN(v)) {
        return;
      }
      if (isNaN(min) || min > v) {
        min = v;
      }
      if (isNaN(max) || min < v) {
        max = v;
      }
    });
    return [min, max];
  }
}
