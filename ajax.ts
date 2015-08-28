/**
 * Created by Samuel Gratzl on 04.08.2014.
 */
/// <reference path="../../tsd.d.ts" />
import plugin = require('./plugin');
import C = require('./main');
'use strict';

/**
 * interface for the ajax adapter
 */
export interface IAjaxAdapter {
  send(url: string, data: any, method : string, expectedDataType : string): Promise<any>;
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

export function send(url: string, data : any = {}, method = 'get', expectedDataType = 'json'): Promise<any> {
  return getConnector().then((c) => c.send(url, data, method, expectedDataType));
}
/**
 * to get some ajax json file
 * @param url
 * @param data
 * @returns {any}
 */
export function getJSON(url: string, data : any = {}): Promise<any> {
  return send(url, data);
}
/**
 * get some generic data via ajax
 * @param url
 * @param data
 * @param expectedDataType
 * @returns {any}
 */
export function getData(url: string, data : any = {}, expectedDataType = 'json'): Promise<any> {
  return send(url, data, 'get', expectedDataType);
}

export function sendAPI(url: string, data : any = {}, method = 'get', expectedDataType = 'json'): Promise<any> {
  url = C.server_url + url + C.server_json_suffix;
  return send(url, data, method, expectedDataType);
}

export function getAPIJSON(url: string, data : any = {}): Promise<any> {
  url = C.server_url + url + C.server_json_suffix;
  return getJSON(url, data);
}
export function getAPIData(url: string, data : any = {}, expectedDataType = 'json'): Promise<any> {
  url = C.server_url + url + C.server_json_suffix;
  return getData(url, data, expectedDataType);
}