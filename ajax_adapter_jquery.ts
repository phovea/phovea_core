/**
 * Created by Samuel Gratzl on 04.08.2014.
 */
/// <reference path="../../tsd.d.ts" />
import ajax = require('./ajax');
import $ = require('jquery');
'use strict';

function wrap(d:JQueryXHR):Promise<any> {
  //since JQueryXHR is thenable
  var r = Promise.resolve(d);
  return r;
}

/**
 * JQuery implementation of the ajax adapter
 */
class JQueryAdapter implements ajax.IAjaxAdapter {
  send(url: string, data: any = {}, method = 'get', expectedDataType = 'json'): Promise<any> {
    var o : JQueryAjaxSettings = {
      url: url,
      data: data,
      method: method,
      dataType: expectedDataType,
      cache: method === 'get'
    };
    if (data instanceof FormData) {
      o.contentType = false;
      o.processData = false;
    }
    return wrap($.ajax(o));
  }
}

export function create() {
  return new JQueryAdapter();
}
