/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 24.09.2014.
 */
import C = require('./main');
import ajax = require('./ajax');
import idtypes = require('./idtype');
import ranges = require('./range');

export interface IIDMapper {
  (...id:number[]) : Promise<ranges.Range>;
  (range:ranges.Range) : Promise<ranges.Range>;
  (id:number[]) : Promise<ranges.Range>;
}

export function map(source:idtypes.IDType, target:idtypes.IDType) : IIDMapper;
export function map(source:idtypes.IDType, target:idtypes.IDType, id:number, ...ids:number[]) : Promise<ranges.Range>;
export function map(source:idtypes.IDType, target:idtypes.IDType, range:ranges.Range) : Promise<ranges.Range>;
export function map(source:idtypes.IDType, target:idtypes.IDType, id:number[]) : Promise<ranges.Range>;

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
  if (Array.isArray(id)) {
    range = ranges.list(<number[]>id);
  } else if (ranges.is(id)) {
    range = <ranges.Range>id;
  } else {
    args.unshift(id);
    range = ranges.list(<number[]>args);
  }
  return mapImpl(source, target, range);
}

var cache : {[key:string] : Promise<ranges.Range> } = {};

function mapImpl(source:idtypes.IDType, target:idtypes.IDType, range:ranges.Range) {
  var key = source.toString()+'->'+target.toString()+':'+range.toString();
  if (cache.hasOwnProperty(key)) {
    return cache[key];
  }

  //TODO clear old cache entries

  var r = ajax.getAPIJSON('/mapper/map',{
    source: source.toString(),
    target: target.toString(),
    range: range.toString()
  }).then((data) => {
    return ranges.parse(data.range);
  });
  cache[key] = r;
  return r;
}
