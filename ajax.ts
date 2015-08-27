/**
 * Created by Samuel Gratzl on 04.08.2014.
 */
/// <reference path="../../tsd.d.ts" />
import plugin = require('./plugin');
import C = require('./main');
'use strict';

export interface IAjaxAdapter {
  getJSON(url: string, data : any): Promise<any>;
  getData(url: string, data : any, expectedDataType): Promise<any>;
  deleteData(url: string, form: FormData, expectedDataType): Promise<any>;
  postForm(url: string, form: FormData, expectedDataType): Promise<any>;
}

var _impl : Promise<IAjaxAdapter> = null;

function getConnector() {
  if (_impl != null) {
    return _impl;
  }
  var adapters = plugin.list('ajax-adapter'),
    adapter = adapters[0];
  if (adapters.length > 1) { //if more than one adapter is there then use not the standard one
    adapter = adapters.filter((d) => d.id !== 'caleydo_adapter_jquery')[0]
  }
  return _impl = adapter.load().then((p) => <IAjaxAdapter>p.factory());
}

export function getJSON(url: string, data : any = {}): Promise<any> {
  return getConnector().then((c) => c.getJSON(url, data));
}
export function getData(url: string, data : any = {}, expectedDataType = 'json'): Promise<any> {
  return getConnector().then((c) => c.getData(url, data, expectedDataType));
}
export function deleteData(url: string, data : any = {}, expectedDataType = 'json'): Promise<any> {
  return getConnector().then((c) => c.deleteData(url, data, expectedDataType));
}
export function postForm(url: string, form: FormData, expectedDataType = 'json'): Promise<any> {
  return getConnector().then((c) => c.postForm(url, form, expectedDataType));
}

export function getAPIJSON(url: string, data : any = {}): Promise<any> {
  url = C.server_url + url + C.server_json_suffix;
  return getJSON(url, data);
}
export function getAPIData(url: string, data : any = {}, expectedDataType = 'json'): Promise<any> {
  url = C.server_url + url + C.server_json_suffix;
  return getData(url, data, expectedDataType);
}
export function deleteAPIData(url: string, data : any = {}, expectedDataType = 'json'): Promise<any> {
  url = C.server_url + url + C.server_json_suffix;
  return deleteData(url, data, expectedDataType);
}
export function postAPIForm(url: string, form: FormData, expectedDataType = 'json') {
  url = C.server_url + url + C.server_json_suffix;
  return postForm(url, form, expectedDataType);
}