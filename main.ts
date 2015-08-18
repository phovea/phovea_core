/**
 * Created by Samuel Gratzl on 04.08.2014.
 */
/// <reference path="../../tsd.d.ts" />
import $ = require('jquery');
import module_ = require('module');
var config = module_.config();
'use strict';

/**
 * version of the core
 */
export var version = '0.0.1-alpha';

export var server_url:string = config.apiUrl;
export var server_json_suffix:string = config.apiJSONSuffix || '';


export interface IPromise<T> extends JQueryPromise<T> {

}

/**
 * wraps the given resolver function to be a promise
 * @param resolver
 * @param {function(resolve, reject)} resolver - the promise resolver
 * @returns {Promise} a promise object
 */
export function promised<T>(f) : IPromise<T> {
  var d = $.Deferred<T>();
  f((r) => {
    d.resolve(r);
  }, (r) => {
    d.reject(r);
  });
  return d.promise();
}
/**
 * wraps the given result as a promise
 * @param result - the result of the promise
 * @returns {Promise} a promise object
 */
export function resolved(result) : IPromise<any> {
  return $.Deferred().resolve(result).promise();
}
export function reject(error) : IPromise<any> {
  return $.Deferred().reject(error).promise();
}
export function asPromise<T>(f: IPromise<T>): IPromise<T>;
export function asPromise<T>(f: T): IPromise<T>;
export function asPromise<T>(f: any): IPromise<T> {
  if (f.hasOwnProperty('then') && $.isFunction(f.then)) {
    return f;
  }
  return resolved(f);
}

/**
 * when all given promises are done
 * @param deferreds the promises to wait for
 * @type {IPromise<Array<any>>}
 */
export function all(promises:any[]):IPromise<Array<any>> {
  return $.when.apply($, promises).then((...args:any[]) => args);
}

/**
 * async JSON loading
 * @see {@link http://api.jquery.com/jQuery.getJSON/}
 */
export var getJSON = $.getJSON;
export var ajax = $.ajax;

export function getAPIJSON(url, ...args:any[]):IPromise<any> {
  //convert to full url
  url = server_url + url + server_json_suffix;
  args.unshift(url);
  return getJSON.apply($, args);
}
export function ajaxAPI(args: any):IPromise<any> {
  //convert to full url
  args.url = server_url + args.url + server_json_suffix;
  return ajax.call($, args);
}
/**
 * integrate b into a and override all duplicates
 * @param {Object} a
 * @param {Object} b
 * @returns {Object} a with extended b
 */
export function mixin(a, ...bs : any[]) {
  bs.unshift(a);
  bs.unshift(a);
  return $.extend.apply($, bs);
}

//wrap function wrap jquery which may be overwritten replaced sometimes
/**
 * test the given object is a function
 */
export var isFunction = $.isFunction;
/**
 * test if the argument t is an array
 */
export var isArray = $.isArray;
/**
 * test if the argument is an empty object, works just for testing objects
 */
export var isEmptyObject = $.isEmptyObject;
/**
 * test if the argument is a plain object, no subclassing
 */
export var isPlainObject = $.isPlainObject;

export function isUndefined(obj:any) {
  return typeof obj === 'undefined';
}

/**
 * binds the given function to the given context / this arg
 * @param f
 * @param thisArg
 * @returns {function(): any}
 */
export function bind(f : () => any, thisArg : any, ...args: any[]) {
  return (...largs) => {
    return f.apply(thisArg ? thisArg : this, args.concat(largs));
  };
}

/**
 * getter generator by name or index
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
 * identity function
 */
export function identity(d:any) {
  return d;
}

/**
 * a dummy function, which does exactly nothing, i.e. used as default
 */
export function noop() {
  //no op
}

/**
 * just returns the argument in any case
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
 * @returns {boolean}
 */
export function constantTrue() {
  return true;
}

/**
 * special constant function which returns always false, i.e., as a default for a filter function
 * @returns {boolean}
 */
export function constantFalse() {
  return true;
}

/**
 * copies a plain object into a function and call a specific method onto direct call
 * @param obj - the
 * @param f
 */
export function callable(obj:any, f:string) {
  //assert this.isPlainObject(obj);
  function CallAbleFactory() {
    var that;

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
 * @return {T}
 */
export function search<T>(arr: T[], f : (v: T) => boolean) : T {
  var r : T = undefined;
  arr.some((v) => {
    if (f(v)) {
      r = v;
      return true;
    }
    return false;
  });
  return r;
}

export function indexOf<T>(arr: T[], f : (v: T) => boolean) : number {
  var r = -1;
  arr.some((v,i) => {
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
 * @returns {*|Array}
 */
export function argList(args:IArguments) {
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
function indexRange(n:number) {
  //http://stackoverflow.com/questions/3746725/create-a-javascript-array-containing-1-n
  return Array.apply(null, {length: n}).map(Number.call, Number);
}

/**
 * returns the sorted indices of this array, when sorting by the given function
 * @param arr
 * @param compareFn
 * @param thisArg
 */
export function argSort<T>(arr:T[], compareFn?:(a:T, b:T) => number, thisArg?:any):number[] {
  var indices = indexRange(arr.length);
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
export function argFilter<T>(arr:T[], callbackfn:(value:T, index:number) => boolean, thisArg?:any):number[] {
  var indices = indexRange(arr.length);
  return indices.filter((value, index) => {
    return callbackfn.call(thisArg, arr[value], index);
  });
}

/**
 * utility function to get notified, when the given dom element is removed from its parent
 * @param s
 * @param callback
 */
export function onDOMNodeRemoved(s:Element[], callback:() => void, thisArg?:any);
/**
 * utility function to get notified, when the given dom element is removed from its parent
 * @param node
 * @param callback
 */
export function onDOMNodeRemoved(node:Element, callback:() => void, thisArg?:any);
/**
 * utility function to get notified, when the given dom element is removed from its parent
 * @param node
 * @param callback
 */
export function onDOMNodeRemoved(node:any, callback:() => void, thisArg?:any) {
  var arr:any[], body = document.getElementsByTagName('body')[0];
  if (!isArray(node)) {
    arr = [node];
  } else {
    arr = <any[]>node;
  }
  arr.forEach((n) => {
    function l(evt) {
      //since this event bubbles check if it the right node
      var act = n;
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

/**
 * unique id container
 * @type {{}}
 */
var idCounter = {};
/**
 * returns a unique id for the given domain
 * @param domain
 * @return {number}
 */
export function uniqueId(domain : string = '_default') {
  if (!idCounter.hasOwnProperty(domain)) {
    idCounter[domain] = 0;
  }
  return idCounter[domain]++;
}

/**
 * returns a string, which is a unique id for the given domain
 * @param domain
 * @return {string}
 */
export function uniqueString(domain : string = '_default') {
  return domain + uniqueId(domain);
}

/**
 * extends class copied from TypeScript compiler
 * @param subClass
 * @param baseClass
 */
export function extendClass(subClass, baseClass) {
  for (var p in baseClass) {
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
  private free : number[] = [];

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
  restore(persisted:any) : IPersistable;
}

/**
 * manages the hash location property helper
 */
class HashProperties {
  private map: any = {};
  private updated = () => {
    this.parse(location.hash);
  };

  constructor() {
    this.map = history.state;
    if (!this.map) {
      this.parse(location.hash);
    }
    window.addEventListener('hashchange', this.updated, false);
  }

  is(name:string) {
    return this.getProp(name, null) != null;
  }

  getProp(name: string, default_ : string) {
    if (this.map.hasOwnProperty(name)) {
      return this.map[name];
    }
    return default_;
  }

  setProp(name: string, value: string, update = true) {
    this.map[name] = value;
    if (update) {
      this.update();
    }
  }

  private update() {
    window.removeEventListener('hashchange', this.updated, false);
    history.pushState(this.map, 'State '+Date.now(), '#'+this.toString());
    window.addEventListener('hashchange', this.updated, false);
  }

  private parse(v : string) {
    this.map = {}; //reset
    if (v[0] === '#') {
      v = v.slice(1);
    }
    var parts = v.split(/[&=]/),
      i = 0, p = null,
      key = null;
    while (i < parts.length) {
      p = parts[i];
      while (p[p.length-1] === '%' || p[p.length-1] === '$') {
        i++;
        p += (p[p.length -1] === '%' ? '=' : '&' ) + parts[i];
      }
      if (key) {
        this.map[key] = p;
        key = null;
      } else {
        key = p; //next round
      }
      i++;
    }
  }

  private escape(v: string) {
    return v.replace(/&/g,'$&').replace(/=/g,'%=');
  }

  toString() {
    var r = [];
    Object.keys(this.map).forEach((key) => {
      r.push(key, '=', this.escape(this.map[key]));
    });
    return r.join('&');
  }
}

export var hash = new HashProperties();
