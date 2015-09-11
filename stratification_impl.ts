/**
 * Created by Samuel Gratzl on 04.08.2014.
 */

'use strict';
import C = require('./main');
import ajax = require('./ajax');
import ranges = require('./range');
import idtypes = require('./idtype');
import datatypes = require('./datatype');
import datas = require('./data');
import vector = require('./vector');
import vector_impl = require('./vector_impl');
import math = require('./math');
import def = require('./stratification');

export interface IStratificationLoader {
  (desc: datatypes.IDataDescription) : Promise<{
    rowIds : ranges.Range;
    rows: string[];
    range: ranges.CompositeRange1D;
  }>;
}

function createRangeFromGroups(name: string, groups: any[]) {
  return ranges.composite(name, groups.map((g) => {
    var r = new ranges.Range1DGroup(g.name, g.color || 'gray', ranges.parse(g.range).dim(0));
    return r;
  }));
}

function viaAPILoader() {
  var _data = undefined;
  return (desc) => {
    if (_data) { //in the cache
      return _data;
    }
    _data = ajax.getAPIJSON('/dataset/'+desc.id).then(function (data) {
      var d = {
        rowIds : ranges.parse(data.rowIds),
        rows : data.rows,
        range: createRangeFromGroups(desc.name, data.groups)
      };
      return d;
    });
    return _data;
  };
}

function viaDataLoader(rows: string[], rowIds: number[], range: ranges.CompositeRange1D) {
  var _data = undefined;
  return (desc) => {
    if (_data) { //in the cache
      return Promise.resolve(_data);
    }
    _data = {
      rowIds : ranges.list(rowIds),
      rows: rows,
      range: range
    };
    return Promise.resolve(_data);
  };
}

/**
 * root matrix implementation holding the data
 */
export class Stratification extends datatypes.DataTypeBase implements def.IStratification {
  private _idtype:idtypes.IDType;
  private _v : Promise<vector.IVector>;

  constructor(public desc:datatypes.IDataDescription, private loader : IStratificationLoader) {
    super(desc);
    var d = <any>desc;
    this._idtype = idtypes.resolve(d.idtype);
  }

  get idtype() {
    return this._idtype;
  }

  /**
   * loads all the underlying data in json format
   * TODO: load just needed data and not everything given by the requested range
   * @returns {*}
   */
  load() : Promise<{
    rowIds : ranges.Range;
    rows: string[];
    range: ranges.CompositeRange1D;
  }> {
    return this.loader(this.desc);
  }

  view(range: ranges.Range) {
    if (range.isAll) {
      return this;
    }
    //TODO
    return this;
  }

  hist() : Promise<math.IHistogram> {
    return null;
    //return this.load().then((d) => {
    //  return math.categoricalHist(d, this.indices.dim(0), d.length, v.categories.map((d) => typeof d === 'string' ? d : d.name));
    //});
  }
  vector(): Promise<vector.IVector> {
    if (this._v) {
      return this._v;
    }
    this._v = this.load().then((data) => new StratificationVector(this, data.range, this.desc));
    return this._v;
  }

  origin(): Promise<datatypes.IDataType> {
    if ('origin' in this.desc) {
      return datas.getFirstByFQName((<any>this.desc).origin);
    }
    return Promise.reject('no origin specified');
  }

  range() {
    return this.load().then(function (data) {
      return data.range;
    });
  }

  names(range:ranges.Range = ranges.all()) {
    var that = this;
    return this.load().then(function (data) {
      return range.filter(data.rows, that.dim);
    });
  }

  ids(range:ranges.Range = ranges.all()): Promise<ranges.Range> {
    var that = this;
    return this.load().then(function (data) {
      return range.preMultiply(data.rowIds, that.dim);
    });
  }

  get idtypes() {
    return [this.idtype];
  }

  size() {
    return (<any>this.desc).size;
  }

  get length() {
    return this.size()[0];
  }

  get dim() {
    return this.size();
  }

  persist() {
    return this.desc.id;
  }
}

/**
 * root matrix implementation holding the data
 */
export class StratificationVector extends vector_impl.VectorBase implements vector.IVector {
  valuetype:any;
  desc: datatypes.IDataDescription;

  constructor(private strat : Stratification, private range: ranges.CompositeRange1D, desc:datatypes.IDataDescription) {
    super(null);
    this._root = this;
    this.valuetype = {
      type: 'categorical',
      categories: range.groups.map((g) => {
        return { name : g.name, color: g.color };
      })
    };
    this.desc = {
      name: desc.name,
      fqname: desc.fqname,
      id: desc.id,
      type: 'vector',
      value: this.valuetype
    };
  }

  get idtype() {
    return this.strat.idtype;
  }

  get idtypes() {
    return [this.idtype];
  }

  persist() {
    return {
      root: this.strat.persist()
    };
  }

  restore(persisted: any) {
    var r : vector.IVector = this;
    if (persisted && persisted.range) { //some view onto it
      r = r.view(ranges.parse(persisted.range));
    }
    return r;
  }

  /**
   * loads all the underlying data in json format
   * TODO: load just needed data and not everything given by the requested range
   * @returns {*}
   */
  load() : Promise<any[]> {

    return Promise.resolve([]); //TODO
  }

  /**
   * access at a specific position
   * @param i
   * @param j
   * @returns {*}
   */
  at(i) {
    return this.load().then(function (d) {
      return d[i];
    });
  }

  data(range:ranges.Range = ranges.all()) {
    var that = this;
    return this.load().then(function (data) {
      return range.filter(data, that.dim);
    });
  }

  names(range:ranges.Range = ranges.all()) {
    return this.strat.names(range);
  }
  ids(range:ranges.Range = ranges.all()) {
    return this.strat.ids(range);
  }

  size() {
    return this.strat.size();
  }

  sort(compareFn?: (a: any, b: any) => number, thisArg?: any): Promise<vector.IVector> {
    return this.data().then((d) => {
      var indices = C.argSort(d, compareFn, thisArg);
      return this.view(ranges.list(indices));
    });
  }

  map<U>(callbackfn: (value: any, index: number) => U, thisArg?: any): Promise<vector.IVector> {
    //FIXME
    return null;
  }

  filter(callbackfn: (value: any, index: number) => boolean, thisArg?: any): Promise<vector.IVector> {
    return this.data().then((d) => {
      var indices = C.argFilter(d, callbackfn, thisArg);
      return this.view(ranges.list(indices));
    });
  }
}

/**
 * module entry point for creating a datatype
 * @param desc
 * @returns {IVector}
 */
export function create(desc: datatypes.IDataDescription): Stratification {
  return new Stratification(desc, viaAPILoader());
}

export function wrap(desc: datatypes.IDataDescription, rows: string[], rowIds: number[], range: ranges.CompositeRange1D) {
  return new Stratification(desc, viaDataLoader(rows, rowIds, range));
}
