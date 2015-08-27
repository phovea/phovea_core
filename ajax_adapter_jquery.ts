/**
 * Created by Samuel Gratzl on 04.08.2014.
 */
/// <reference path="../../tsd.d.ts" />
import ajax = require('./ajax');
import $ = require('jquery');
'use strict';

function wrap(d:JQueryXHR):Promise<any> {
  var r = Promise.resolve(d);
  return r;
}

class JQueryAdapter implements ajax.IAjaxAdapter {
  getJSON(url:string, data:any = {}):Promise<any> {
    return wrap($.getJSON(url, data));
  }

  getData(url:string, data:any = {}, expectedDataType = 'json'):Promise<any> {
    return wrap($.ajax({
      url: url,
      dataType: expectedDataType,
      data: data
    }));
  }

  deleteData(url:string, data:any = {}, expectedDataType = 'json'):Promise<any> {
    return wrap($.ajax({
      url: url,
      data: data,
      method: 'delete',
      dataType: expectedDataType,
      cache: false
    }));
  }

  postForm(url:string, form:FormData, expectedDataType = 'json'):Promise<any> {
    return wrap($.ajax({
      url: url,
      method: 'post',
      dataType: expectedDataType,
      data: form,
      cache: false,
      contentType: false,
      processData: false
    }));
  }
}

export function create() {
  return new JQueryAdapter();
}