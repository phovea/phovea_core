/**
 * Created by Samuel Gratzl on 04.08.2014.
 */
/// <reference path="../../tsd.d.ts" />
import ajax = require('./ajax');
import d3 = require('d3');
'use strict';

/**
 * D3 implementation of the ajax adapter
 */
class D3Adapter implements ajax.IAjaxAdapter {
  send(url: string, data: any = {}, method = 'get', expectedDataType = 'json'): Promise<any> {
    return new Promise((resolve, reject) => {
      if (method === 'get' || method === 'head') {
        data = getParams(data);
        if (data) {
          url += (/\?/.test(url) ? '&' : '?') + data;
        }
        data = null;
      }
      var xhr = d3.xhr(url);
      if (!(data instanceof FormData)) {
        xhr.header('Content-Type','application/x-www-form-urlencoded');
      }
      xhr.send(method, data instanceof FormData ? data: getParams(data), (error, _raw) => {
        if (error) {
          reject(error);
        } else {
          resolve(parse(_raw, expectedDataType));
        }
      });
    });
  }
}

export function create() {
  return new D3Adapter();
}

function parse(_raw: XMLHttpRequest, dataType = 'json') {
  if (dataType === 'json') {
    return JSON.parse(_raw.responseText);
  }
  return _raw.responseText;
}

/**
 * convert a given object to url data similar to JQuery
 * @param url
 * @param data
 * @returns {any}
 */
function getParams(data = null) {
  if (data === null) {
    return null;
  }
  if (typeof data === 'string') {
    return encodeURIComponent(data);
  }
  var keys = Object.keys(data);
  if (keys.length === 0) {
    return null;
  }
  var s = [];
  function add(prefix, key, value) {
    if (Array.isArray(value)) {
      value.forEach((v, i) => {
        if (typeof v === 'object') {
          add(prefix,'['+i+']', v);
        } else {
          //primitive values uses the same key
          add(prefix,'[]', v);
        }
      });
    } else if (typeof value === 'object' ) {
      Object.keys(value).forEach((v) => {
        add(prefix, key+'['+v+']',value[v]);
      });
    } else {
      s.push(encodeURIComponent(prefix+key) + '=' + encodeURIComponent(value));
    }
  }
  keys.forEach((key) => {
    add('',key, data[key]);
  });

  // Return the resulting serialization
  return s.join('&').replace(/%20/g, '+');
}