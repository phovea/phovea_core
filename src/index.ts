/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */

/**
 * version of the core
 */
declare const __VERSION__;
export const version = __VERSION__;

/**
 * whether the standard api calls should be prevented
 * @type {boolean}
 */
export let offline = false;
/**
 * server prefix ofr api calls
 * @type {string}
 */
export let server_url: string = '/api';
/**
 * server suffix for api calls
 * @type {string}
 */
export let server_json_suffix: string = '';

/**
 * initializes certain properties of the core
 * @param config
 */
export function init(config: {offline?: boolean, server_url?: string, server_json_suffix?: string} = {}) {
  config = mixin({
    offline: offline,
    server_url: server_url,
    server_json_suffix: server_json_suffix
  }, config);
  offline = config.offline;
  server_url = config.server_url;
  server_json_suffix = config.server_json_suffix;
}

/**
 * initializes itself based on script data attributes
 * @private
 */
function _init() {
  function find(name: string, camelCaseName = name.slice(0, 1).toUpperCase() + name.slice(1)) {
    const node: HTMLElement = <HTMLElement>document.currentScript || <HTMLElement>document.querySelector(`script[data-phovea-${name}]`);
    if (!node) {
      return undefined;
    }
    return node.dataset['phovea' + camelCaseName];
  }

  const config: any = {};
  if ('true' === find('offline')) {
    config.offline = true;
  }
  let v;
  if ((v = find('server-url', 'ServerUrl')) !== undefined) {
    config.server_url = v;
  }
  if ((v = find('server-json-suffix', 'ServerJsonSuffix')) !== undefined) {
    config.server_json_suffix = v;
  }
  //init myself
  init(config);
}
_init();

/**
 * integrate b into a and override all duplicates
 * @param {Object} a
 * @param {Object} bs
 * @returns {Object} a with extended b
 */
export function mixin<T>(a: T, ...bs: any[]): T {
  function extend(r, b) {
    Object.keys(b).forEach((key) => {
      let v = b[key];
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
  return a;
}

/**
 * @deprecated use obj === undefined directly
 * @param obj
 * @return {boolean}
 */
export function isUndefined(obj: any) {
  return typeof obj === 'undefined';
}


//fixes a javascript bug on using "%" with negative numbers
export function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

/**
 * binds the given function to the given context / this arg
 * @deprecated use Function.prototype.bind directly
 * @param f
 * @param thisArg
 * @returns {function(): any}
 */
export function bind(f: () => any, thisArg: any, ...args: any[]) {
  return (...largs) => {
    return f.apply(thisArg ? thisArg : this, args.concat(largs));
  };
}

/**
 * getter generator by name or index
 * @deprecated too simple to write
 * @param attr
 */
export function getter(...index: number[]);
export function getter(...attr: string[]);
export function getter(...attr: any[]) {
  if (attr.length === 1) {
    return (obj) => obj[attr[0]];
  }
  return (obj) => attr.map((a) => obj[a]);
}

/**
 * @deprecated use `typeof(f) === 'function`
 * @param f
 * @return {boolean}
 */
export function isFunction(f: any) {
  return typeof(f) === 'function';
}

/**
 * @deprecated use `(d) => d`
 * identity function
 */
export function identity(d: any) {
  return d;
}

/**
 * a dummy function, which does exactly nothing, i.e. used as default
 * @deprecated use `()=>undefined`
 */
export function noop() {
  //no op
}

/**
 * just returns the argument in any case
 * @deprecated use `() => x`
 * @param r - the value to return
 * @returns {*}
 */
export function constant(r) {
  if (typeof r === 'boolean' && r === true) {
    return constantTrue;
  }
  if (typeof r === 'boolean' && r === false) {
    return constantFalse;
  }
  return () => r;
}

/**
 * special constant function which returns always true, i.e., as a default for a filter function
 * @deprecated use ()=>true
 * @returns {boolean}
 */
export function constantTrue() {
  return true;
}

/**
 * special constant function which returns always false, i.e., as a default for a filter function
 * @deprecated use ()=>false
 * @returns {boolean}
 */
export function constantFalse() {
  return false;
}

/**
 * copies a plain object into a function and call a specific method onto direct call
 * @param obj - the
 * @param f
 * @deprecated
 */
export function callable(obj: any, f: string) {
  //assert this.isPlainObject(obj);
  function CallAbleFactory() {
    let that;

    function CallAble() {
      that[f].apply(that, argList(arguments));
    }

    that = CallAble;
    mixin(CallAble, obj);
    return CallAble;
  }

  return CallAbleFactory;
}

/**
 * search item in array by function
 * @param arr
 * @param f
 * @deprecated use Array.prototype.find
 * @return {T}
 */
export function search<T>(arr: T[], f: (v: T) => boolean): T {
  let r: T = undefined;
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
 * converts the given arguments object into an array
 * @param args
 * @deprecated use Array.from(arguments) instead
 * @returns {*|Array}
 */
export function argList(args: IArguments) {
  if (arguments.length > 1) {
    return Array.prototype.slice.call(arguments);
  } else {
    return Array.prototype.slice.call(args);
  }
}

/**
 * array with indices of 0...n-1
 * @param n
 * @returns {any[]}
 */
function indexRange(n: number) {
  //http://stackoverflow.com/questions/3746725/create-a-javascript-array-containing-1-n
  return Array.apply(null, {length: n}).map(Number.call, Number);
}

/**
 * returns the sorted indices of this array, when sorting by the given function
 * @param arr
 * @param compareFn
 * @param thisArg
 */
export function argSort<T>(arr: T[], compareFn?: (a: T, b: T) => number, thisArg?: any): number[] {
  const indices = indexRange(arr.length);
  return indices.sort((a, b) => {
    return compareFn.call(thisArg, arr[a], arr[b]);
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
  return indices.filter((value, index) => {
    return callbackfn.call(thisArg, arr[value], index);
  });
}

/**
 * generates a random id of the given length
 * @param length length of the id
 * @returns {string}
 */
export function randomId(length = 8) {
  let id = '';
  while (id.length < length) {
    id += Math.random().toString(36).slice(-8);
  }
  return id.substr(0, length);
}
export const random_id = randomId;

/**
 * fixes a given name by converting it to plain camelcase
 * @param name
 * @return {string}
 */
export function fixId(name: string) {
  const clean = name.replace(/[\s!#$%&'()*+,.\/:;<=>?@\[\\\]\^`{|}~_-]/g, ' ');
  const words = clean.trim().split(/\s+/); //remove heading and trailing spaces and combine multiple one during split
  return words.map((w, i) => (i === 0 ? w[0].toLowerCase() : w[0].toUpperCase()) + w.slice(1)).join('');
}
export const fix_id = fixId;

/**
 * utility function to get notified, when the given dom element is removed from its parent
 * @param node
 * @param callback
 */
export function onDOMNodeRemoved(node: Element|Element[], callback: () => void, thisArg?: any) {
  let arr: any[];
  const body = document.getElementsByTagName('body')[0];
  if (!Array.isArray(node)) {
    arr = [node];
  } else {
    arr = <any[]>node;
  }
  arr.forEach((n) => {
    function l(evt) {
      //since this event bubbles check if it the right node
      let act = n;
      while (act) { //check if node or its parent are removed
        if (evt.target === act) {
          node = null;
          n.removeEventListener('DOMNodeRemoved', l);
          body.removeEventListener('DOMNodeRemoved', l);
          callback.call(thisArg, n);
          return;
        }
        act = act.parentNode;
      }
    }

    n.addEventListener('DOMNodeRemoved', l);
    body.addEventListener('DOMNodeRemoved', l);
  });
}

// TODO convert to Map
/**
 * unique id container
 * @type {{}}
 */
const idCounter = new Map<string, number>();
/**
 * returns a unique id for the given domain
 * @param domain
 * @return {number}
 */
export function uniqueId(domain: string = '_default') {
  if (!idCounter.has(domain)) {
    idCounter.set(domain, 0);
  }
  const v = idCounter.get(domain);
  idCounter.set(domain, v + 1);
  return v;
}

export function flagId(domain: string, id: number) {
  if (isNaN(id) || id < 0) {
    return id;
  }
  if (!idCounter.has(domain)) {
    idCounter.set(domain, id + 1);
  } else {
    idCounter.set(domain, Math.max(idCounter.get(domain), id + 1)); //use the next one afterwards
  }
  return id;
}

/**
 * returns a string, which is a unique id for the given domain
 * @param domain
 * @return {string}
 */
export function uniqueString(domain: string = '_default') {
  return domain + uniqueId(domain);
}

/**
 * extends class copied from TypeScript compiler
 * @param subClass
 * @param baseClass
 */
export function extendClass(subClass, baseClass) {
  for (let p in baseClass) {
    if (baseClass.hasOwnProperty(p)) {
      subClass[p] = baseClass[p];
    }
  }
  /* tslint:disable:no-unused-variable */
  function __() {
    this.constructor = subClass;
  }

  __.prototype = baseClass.prototype;
  subClass.prototype = new __();
  /* tslint:enable:no-unused-variable */
}

/**
 * utility class for handling a bunch of reuseable ids
 */
export class IdPool {
  private counter = 0;
  private free: number[] = [];

  /**
   * check out a new id
   * @return {*}
   */
  checkOut() {
    if (this.free.length === 0) { //no more cached
      return this.counter++;
    } else {
      return this.free.shift();
    }
  }

  /**
   * returns an id again
   * @param id
   */
  checkIn(id: number) {
    //returned the last one, can decrease the counter
    if (id === this.counter - 1) {
      this.counter--;
    } else {
      this.free.push(id);
    }
  }

  /**
   * whether the given id is used
   * @param id
   * @return {boolean}
   */
  isCheckedOut(id: number) {
    //smaller than counter and not a free one
    return id < this.counter && this.free.indexOf(id) < 0;
  }

  /**
   * return the number of checked out ids
   * @return {number}
   */
  get size() {
    return this.counter - this.free.length;
  }
}


export interface IPersistable {
  /**
   * persist the current configuration and return
   */
  persist(): any;
  /**
   * restores from stored persisted state
   * @param persisted a result of a previous persist call
   * @return the restored view or null if it could be in place restored
   */
  restore(persisted: any): IPersistable|Promise<IPersistable>;
}

class PropertyHandler {
  protected map = new Map<string, any>();

  constructor(code?: string) {
    if (code) {
      this.parse(code);
    }
  }

  /**
   * returns the contained keys of this property handler
   * @returns {string[]}
   */
  keys() {
    return Array.from(this.map.keys());
  }

  /**
   * iterate over each entry in the map
   * @param f
   */
  forEach(f: (key: string, value: any) => void) {
    this.map.forEach((v, k) => f(k, v));
  }

  /**
   * whether the given name is defined i.e., not null
   * @deprecated use has(name)
   * @param name
   * @returns {boolean}
   */
  is(name: string) {
    return this.has(name);
  }

  has(name: string) {
    return this.getProp(name, null) != null;
  }

  /**
   * returns the given value with optional default value
   * @param name
   * @param default_
   * @returns {any}
   */
  getProp(name: string, default_: string = null) {
    if (this.map.has(name)) {
      const v = this.map.get(name);
      return v === null ? null : v.toString();
    }
    return default_;
  }

  /**
   * returns the given integer value with optinal default, the value itself might be encoded to safe space
   * @param name
   * @param default_
   * @returns {number}
   */
  getInt(name: string, default_: number = NaN) {
    let l: string = this.getProp(name, null);
    if (l === null) {
      return default_;
    }
    if (l.match(/[0-9-.]/) != null) {
      return parseInt(l, 10);
    }
    return parseInt(l, 36);
  }

  /**
   * removes the property from the map
   * @param name
   * @returns {boolean}
   */
  removeProp(name: string) {
    if (this.map.has(name)) {
      this.map.delete(name);
      return true;
    }
    return false;
  }

  toString() {
    let r = [];
    this.map.forEach((v, key) => {
      r.push(encodeURIComponent(key) + '=' + encodeURIComponent(v));
    });
    return r.join('&');
  }

  protected parse(code: string = '') {
    //if available use https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
    this.map.clear();
    if (code.length <= 1) { //just the starting character ? or #
      return;
    }
    //http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript/21152762#21152762
    code.substr(1).split('&').forEach((item) => {
      const s = item.split('='),
        k = decodeURIComponent(s[0]),
        v = s[1] && decodeURIComponent(s[1]);
      if (this.map.has(k)) {
        let old = this.map.get(k);
        if (!Array.isArray(old)) {
          this.map.set(k, [old, v]);
        } else {
          this.map.get(k).push(v);
        }
      } else {
        this.map.set(k, v);
      }
    });
  }
}


/**
 * manages the hash location property helper
 */
class HashProperties extends PropertyHandler {
  private updated = () => {
    this.parse(location.hash);
  };

  constructor() {
    super();
    this.map = history.state;
    if (!this.map) {
      this.parse(location.hash);
    }
    window.addEventListener('hashchange', this.updated, false);
  }

  setInt(name: string, value: number, update = true) {
    let v = String(value);
    if (value > 100) {
      //idea encode the the using a different radix
      v = value.toString(36);
    }
    this.setProp(name, String(value), update);
  }

  setProp(name: string, value: string, update = true) {
    this.map.set(name, value);
    if (update) {
      this.update();
    }
  }

  removeProp(name: string, update = true) {
    if (this.map.has(name)) {
      this.map.delete(name);
      if (update) {
        this.update();
      }
      return true;
    }
    return false;
  }

  private update() {
    window.removeEventListener('hashchange', this.updated, false);
    history.pushState(this.map, 'State ' + Date.now(), '#' + this.toString());
    window.addEventListener('hashchange', this.updated, false);
  }
}

/**
 * access to hash parameters and set them, too
 * @type {HashProperties}
 */
export const hash = new HashProperties();
/**
 * access to get parameters
 * @type {PropertyHandler}
 */
export const param = new PropertyHandler(location.search);


/**
 * create a delayed call, can be called multiple times but only the last one at most delayed by timeToDelay will be executed
 * @param callback
 * @param thisCallback
 * @param timeToDelay
 * @return {function(...[any]): undefined}
 */
export function delayedCall(callback: () => void, timeToDelay = 100, thisCallback = this) {
  let tm = -1;
  return (...args: any[]) => {
    if (tm >= 0) {
      clearTimeout(tm);
      tm = -1;
    }
    args.unshift(thisCallback);
    tm = setTimeout(callback.bind.apply(callback, args), timeToDelay);
  };
}


/**
 * computes the absolute offset of the given element
 * @param element
 * @return {{left: number, top: number, width: number, height: number}}
 */
export function offset(element: Element) {
  if (!element) {
    return {left: 0, top: 0, width: 0, height: 0};
  }
  const obj = element.getBoundingClientRect();
  return {
    left: obj.left + window.pageXOffset,
    top: obj.top + window.pageYOffset,
    width: obj.width,
    height: obj.height
  };
}

/**
 * returns the bounding box of a given element similar to offset
 * @param element
 * @returns {{x: number, y: number, w: number, h: number}}
 */
export function bounds(element: Element) {
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
 * utility for drag-n-drop support
 * @param e
 * @param type
 * @returns {any}
 */
export function hasDnDType(e, type) {
  const types = e.dataTransfer.types;

  /*
   * In Chrome datatransfer.types is an Array,
   * while in Firefox it is a DOMStringList
   * that only implements a contains-method!
   */
  if (typeof(types.indexOf) === 'function') {
    return types.indexOf(type) >= 0;
  }
  if (typeof(types.includes) === 'function') {
    return types.includes(type);
  }
  if (typeof(types.contains) === 'function') {
    return types.contains(type);
  }
  return false;
}

/**
 * checks whether it is a copy operation
 * @param e
 * @returns {boolean|RegExpMatchArray}
 */
export function copyDnD(e) {
  const dT = e.dataTransfer;
  return (e.ctrlKey && dT.effectAllowed.match(/copy/gi)) || (!dT.effectAllowed.match(/move/gi));
}
/**
 * updates the drop effect accoriding to the current copyDnD state
 * @param e
 */
export function updateDropEffect(e) {
  const dT = e.dataTransfer;
  if (copyDnD(e)) {
    dT.dropEffect = 'copy';
  } else {
    dT.dropEffect = 'move';
  }
}

/**
 * returns a promise that resolves in the given number of milliseconds
 * @param milliseconds the number of milliseconds to resolve
 */
export function resolveIn(milliseconds: number): Promise<void> {
  if (milliseconds <= 0) {
    return Promise.resolve<void>(null);
  }
  return new Promise<void>((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}
