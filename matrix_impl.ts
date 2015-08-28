/**
 * Created by Samuel Gratzl on 04.08.2014.
 */

'use strict';
import C = require('./main');
import ajax = require('./ajax');
import ranges = require('./range');
import idtypes = require('./idtype');
import datatypes = require('./datatype');
import vector = require('./vector');
import vector_impl = require('./vector_impl');
import math = require('./math');
import matrix = require('./matrix');



function flatten(arr : any[][], indices: ranges.Range, select: number = 0) {
  var r = [], dim = [arr.length, arr[0].length];
  if (select === 0) {
    r = r.concat.apply(r, arr);
  } else {
    //stupid slicing
    for(var i = 0; i < dim[1]; ++i) {
      arr.forEach((ai) => {
        r.push(ai[i]);
      });
    }
  }
  return {
    data : r,
    indices: indices.dim(select).repeat(dim[1-select])
  };
}


/**
 * base class for different Matrix implementations, views, transposed,...
 */
export class MatrixBase extends idtypes.SelectAble {
  constructor(public _root:matrix.IMatrix) {
    super();
  }

  size():number[] {
    throw new Error('not implemented');
  }

  get dim() {
    return this.size();
  }

  get length() {
    return this.nrow * this.ncol;
  }

  get nrow() {
    return this.dim[0];
  }

  get ncol() {
    return this.dim[1];
  }

  get indices() : ranges.Range {
    return ranges.range([0, this.nrow], [0, this.ncol]);
  }

  data() : Promise<any[]> {
    throw new Error('not implemented');
  }

  view(): matrix.IMatrix;
  view(range:ranges.Range) : matrix.IMatrix;
  //view(filter: string): Promise<matrix.IMatrix>;
  view(): any {
    if (typeof arguments[0] === 'string') {
      return this.dynview(<string>arguments[0]);
    }
    var range : ranges.Range = arguments.length === 0 ? ranges.all() : arguments[0];
    if (range.isAll) {
      return this._root;
    }
    return new MatrixView(this._root, range);
  }

  dynview(filter: string): Promise<matrix.IMatrix> {
    return null;
  }

  stats() : Promise<math.IStatistics> {
    return this.data().then((d) => math.computeStats.apply(math,d));
  }

  hist(bins? : number, containedIds = 0) : Promise<math.IHistogram> {
    var v = this._root.valuetype;
    return this.data().then((d) => {
      var flat = flatten(d, this.indices, containedIds);
      switch(v.type) {
        case 'categorical':
          return math.categoricalHist(flat.data, flat.indices, flat.data.length, v.categories.map((d) => typeof d === 'string' ? d : d.name));
        case 'real':
        case 'int':
          return math.hist(flat.data, flat.indices, flat.data.length, bins ? bins : Math.round(Math.sqrt(this.length)), v.range);
        default:
          return null; //cant create hist for unique objects or other ones
      }
    });
  }

  idView(idRange:ranges.Range = ranges.all()) : Promise<matrix.IMatrix> {
    if (idRange.isAll) {
      return Promise.resolve(this._root);
    }
    return this.ids().then((ids) => this.view(ids.indexOf(idRange)));
  }

  reduce(f : (row : any[]) => any, this_f? : any, valuetype? : any, idtype? : idtypes.IDType) : vector.IVector {
    return new ProjectedVector(<matrix.IMatrix>(<any>this), f, this_f, valuetype, idtype);
  }

  restore(persisted: any) : C.IPersistable {
    if (persisted && persisted.f) {
      /* tslint:disable:no-eval */
      return this.reduce(eval(persisted.f), this, persisted.valuetype, persisted.idtype ? idtypes.resolve(persisted.idtype) : undefined);
      /* tslint:enable:no-eval */
    } else if (persisted && persisted.range) { //some view onto it
      return this.view(ranges.parse(persisted.range));
    } else if (persisted && persisted.transposed) {
      return (<matrix.IMatrix>(<any>this)).t;
    } else {
      return <C.IPersistable>(<any>this);
    }
  }
}

export interface IMatrixLoader {
  (desc: datatypes.IDataDescription) : Promise<{
    rowIds : ranges.Range;
    rows : string[];
    colIds : ranges.Range;
    cols : string[];
    ids: ranges.Range;
    data : any[][];
  }>;
}


function viaAPILoader() {
  var _loader = undefined;
  return (desc) => {
    if (_loader) { //in the cache
      return _loader;
    }
    return _loader = ajax.getAPIJSON('/dataset/'+desc.id).then(function (data) {
      data.rowIds = ranges.parse(data.rowIds);
      data.colIds = ranges.parse(data.colIds);
      data.ids = ranges.list(data.rowIds.dim(0), data.colIds.dim(0));
      return data;
    });
  };
}

/**
 * root matrix implementation holding the data
 */
export class Matrix extends MatrixBase implements matrix.IMatrix {
  t:matrix.IMatrix;
  valuetype:any;
  rowtype:idtypes.IDType;
  coltype:idtypes.IDType;

  constructor(public desc: datatypes.IDataDescription, private loader: IMatrixLoader) {
    super(null);
    this._root = this;
    var d = <any>desc;
    this.valuetype = d.value;
    this.rowtype = idtypes.resolve(d.rowtype);
    this.coltype = idtypes.resolve(d.coltype);
    this.t = new TransposedMatrix(this);
  }

  /**
   * loads all the underlying data in json format
   * TODO: load just needed data and not everything given by the requested range
   * @returns {*}
   */
  load() : Promise<any> {
    return this.loader(this.desc);
  }

  get idtypes() {
    return [this.rowtype, this.coltype];
  }

  /**
   * access at a specific position
   * @param i
   * @param j
   * @returns {*}
   */
  at(i, j) {
    return this.load().then(function (d) {
      return d.data[i][j];
    });
  }

  data(range: ranges.Range = ranges.all()) {
    var that = this;
    return this.load().then(function (data) {
      return range.filter(data.data, that.size());
    });
  }
  ids(range:ranges.Range = ranges.all()) {
    var that = this;
    return this.load().then(function (data) {
      return range.preMultiply(data.ids, that.dim);
    });
  }


  /**
   * return the column ids of the matrix
   * @returns {*}
   */
  cols(range: ranges.Range= ranges.all()) : Promise<string[]> {
    var that = this;
    return this.load().then(function (d : any) {
      return range.dim(1).filter(d.cols, that.ncol);
    });
  }
  colIds(range:ranges.Range = ranges.all()) {
    var that = this;
    return this.load().then(function (data) {
      return range.preMultiply(data.colIds, that.dim);
    });
  }

  /**
   * return the row ids of the matrix
   * @returns {*}
   */
  rows(range: ranges.Range = ranges.all()) : Promise<string[]> {
    var that = this;
    return this.load().then(function (d : any) {
      return range.dim(0).filter(d.rows, that.nrow);
    });
  }
  rowIds(range:ranges.Range = ranges.all()) {
    var that = this;
    return this.load().then(function (data) {
      return range.preMultiply(data.rowIds, that.dim);
    });
  }

  size() {
    return (<any>this.desc).size;
  }

  persist() {
    return this.desc.id;
  }
}

/**
 * view on the underlying matrix as transposed version
 * @param base
 * @constructor
 */
class TransposedMatrix extends MatrixBase  implements matrix.IMatrix {
  t:matrix.IMatrix;

  constructor(base:Matrix) {
    super(base);
    this.t = base;
  }

  get desc() {
    return this._root.desc;
  }

  persist() {
    return {
      root: this._root.persist(),
      transposed: true
    };
  }

  get valuetype() {
    return this._root.valuetype;
  }

  get rowtype() {
    return this._root.coltype;
  }

  get coltype() {
    return this._root.rowtype;
  }

  get idtypes() {
    return [this.rowtype, this.coltype];
  }

  ids(range:ranges.Range = ranges.all()) {
    return this.t.ids(range ? range.swap() : undefined);
  }

  cols(range:ranges.Range = ranges.all()): Promise<string[]> {
    return this.t.rows(range ? range.swap() : undefined);
  }
  colIds(range:ranges.Range = ranges.all()) {
    return this.t.rowIds(range ? range.swap() : undefined);
  }

  rows(range:ranges.Range = ranges.all()): Promise<string[]> {
    return this.t.cols(range ? range.swap() : undefined);
  }
  rowIds(range:ranges.Range = ranges.all()) {
    return this.t.colIds(range ? range.swap() : undefined);
  }

  view(range:ranges.Range = ranges.all()) : matrix.IMatrix {
    if (range.isAll) {
      return this;
    }
    return new MatrixView(this._root, range.swap()).t;
  }

  size() {
    var s = this.t.dim;
    return [s[1], s[0]]; //swap dimension
  }

  at(i:number, j:number) {
    return this.t.at(j, i);
  }

  data(range:ranges.Range = ranges.all()) {
    return this.t.data(range ? range.swap() : undefined).then((data : any[][]) => datatypes.transpose(data));
  }
}

/**
 * view on the matrix restricted by a range
 * @param root underlying matrix
 * @param range range selection
 * @param t optional its transposed version
 * @constructor
 */
class MatrixView extends MatrixBase implements matrix.IMatrix {
  constructor(root:matrix.IMatrix, private range:ranges.Range, public t? : matrix.IMatrix) {
    super(root);
    this.range = range;
    if (!t) {
      this.t = new MatrixView(root.t, range.swap(), this);
    }
  }

  get desc() {
    return this._root.desc;
  }

  persist() {
    return {
      root: this._root.persist(),
      range: this.range.toString()
    };
  }

  ids(range: ranges.Range = ranges.all()) {
    return this._root.ids(this.range.preMultiply(range, this._root.dim));
  }

  cols(range: ranges.Range = ranges.all()) {
    return this._root.cols(this.range.preMultiply(range, this._root.dim));
  }
  colIds(range: ranges.Range = ranges.all()) {
    return this._root.colIds(this.range.preMultiply(range, this._root.dim));
  }

  rows(range: ranges.Range = ranges.all()) {
    return this._root.rows(this.range.preMultiply(range, this._root.dim));
  }
  rowIds(range: ranges.Range = ranges.all()) {
    return this._root.rowIds(this.range.preMultiply(range, this._root.dim));
  }

  size() {
    return this.range.size(this._root.dim);
  }

  at(i: number, j : number) {
    var inverted = this.range.invert([i, j], this._root.dim);
    return this._root.at(inverted[0], inverted[1]);
  }

  data(range: ranges.Range = ranges.all()) {
    return this._root.data(this.range.preMultiply(range, this._root.dim));
  }

  view(range: ranges.Range = ranges.all()) {
    if (range.isAll) {
      return this;
    }
    return new MatrixView(this._root, this.range.preMultiply(range, this.dim));
  }

  get valuetype() {
    return this._root.valuetype;
  }

  get rowtype() {
    return this._root.rowtype;
  }

  get coltype() {
    return this._root.coltype;
  }

  get idtypes() {
    return [this.rowtype, this.coltype];
  }
}

/**
 * a simple projection of a matrix columns to a vector
 */
class ProjectedVector extends vector_impl.VectorBase implements vector.IVector {
  desc : datatypes.IDataDescription;

  constructor(private m : matrix.IMatrix, private f : (row : any[]) => any, private this_f = m, public valuetype = m.valuetype, private _idtype = m.rowtype) {
    super(null);
    this.desc = {
      name : m.desc.name+'-p',
      fqname : m.desc.fqname+'-p',
      type : 'vector',
      id : m.desc.id+'-p'
    };
    this._root = this;
  }

  persist() {
    return {
      root: this.m.persist(),
      f: this.f.toString(),
      valuetype: this.valuetype === this.m.valuetype ? undefined : this.valuetype,
      idtype: this.idtype === this.m.rowtype ? undefined: this.idtype.name
    };
  }

  restore(persisted: any) {
    var r : vector.IVector = this;
    if (persisted && persisted.range) { //some view onto it
      r = r.view(ranges.parse(persisted.range));
    }
    return r;
  }

  get idtype() {
    return this._idtype;
  }

  get idtypes() {
    return [this._idtype];
  }

  size() {
    return this.m.nrow;
  }
  /**
   * return the associated ids of this vector
   */
  names(range?:ranges.Range) : Promise<string[]> {
    return this.m.rows(range);
  }
  ids(range?:ranges.Range) {
    return this.m.rowIds(range);
  }

  /**
   * returns a promise for getting one cell
   * @param i
   * @param j
   */
  at(i:number) : Promise<any> {
    return this.m.data(ranges.list(i)).then((d)=> {
      return this.f.call(this.this_f, d[0]);
    });
  }
  /**
   * returns a promise for getting the data as two dimensional array
   * @param range
   */
  data(range?:ranges.Range) : Promise<any[]> {
    return this.m.data(range).then((d)=> {
      return d.map(this.f, this.this_f);
    });
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
 * @returns {IMatrix}
 */
export function create(desc: datatypes.IDataDescription): matrix.IMatrix {
  if (C.isFunction((<any>desc).loader)) {
    return new Matrix(desc, (<any>desc).loader);
  }
  return new Matrix(desc, viaAPILoader());
}
