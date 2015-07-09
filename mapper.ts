/**
 * Created by Samuel Gratzl on 24.09.2014.
 */
/// <reference path="../../tsd.d.ts" />
import C = require('./main');
import idtypes = require('./idtype');
import ranges = require('./range');
import d3 = require('d3');
'use strict';

export interface IIDMapper {
  (...id:number[]) : C.IPromise<ranges.Range>;
  (range:ranges.Range) : C.IPromise<ranges.Range>;
  (id:number[]) : C.IPromise<ranges.Range>;
}

export function map(source:idtypes.IDType, target:idtypes.IDType) : IIDMapper;
export function map(source:idtypes.IDType, target:idtypes.IDType, id:number, ...ids:number[]) : C.IPromise<ranges.Range>;
export function map(source:idtypes.IDType, target:idtypes.IDType, range:ranges.Range) : C.IPromise<ranges.Range>;
export function map(source:idtypes.IDType, target:idtypes.IDType, id:number[]) : C.IPromise<ranges.Range>;

export function map(source:idtypes.IDType, target:idtypes.IDType) : any {
  var that = this;
  if (arguments.length === 2) {
    //return a mapper
    return function() {
      var args = C.argList(arguments);
      args.unshift(target);
      args.unshift(source);
      return map.apply(that, args);
    };
  }
  var args = C.argList(arguments);
  args.shift(); //source
  args.shift(); //target
  var id = args.shift(), range;
  //check type and create a range out of it
  if (C.isArray(id)) {
    range = ranges.list(<number[]>id);
  } else if (ranges.is(id)) {
    range = <ranges.Range>id;
  } else {
    args.unshift(id);
    range = ranges.list(<number[]>args);
  }
  return mapImpl(source, target, range);
}

var cache = d3.map<C.IPromise<ranges.Range>>();

function mapImpl(source:idtypes.IDType, target:idtypes.IDType, range:ranges.Range) {
  var key = source.toString()+'->'+target.toString()+':'+range.toString();
  if (cache.has(key)) {
    return cache.get(key);
  }

  //TODO clear old cache entries

  var r = C.getAPIJSON('/mapper/map',{
    source: source.toString(),
    target: target.toString(),
    range: range.toString()
  }).then((data) => {
    return ranges.parse(data.range);
  });
  cache.set(key, r);
  return r;
}
