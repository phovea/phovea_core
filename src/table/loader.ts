/**
 * Created by Samuel Gratzl on 27.12.2016.
 */


import {getAPIJSON, getAPIData} from '../ajax';
import {Range, parse, range} from '../range';
import {IValueType, VALUE_TYPE_INT, VALUE_TYPE_REAL, INumberValueTypeDesc, mask} from '../datatype';
import {IQueryArgs, ITableDataDescription, ITableColumn} from './ITable';

export interface ITableLoader {
  (desc: ITableDataDescription): Promise<{
    rowIds: Range;
    rows: string[];
    objs: any[];
  }>;
}

export interface ITableLoader2 {
  rowIds(desc: ITableDataDescription, range: Range): Promise<Range>;
  rows(desc: ITableDataDescription, range: Range): Promise<string[]>;
  col(desc: ITableDataDescription, column: string, range: Range): Promise<IValueType[]>;
  objs(desc: ITableDataDescription, range: Range): Promise<any[]>;
  data(desc: ITableDataDescription, range: Range): Promise<IValueType[][]>;
  view(desc: ITableDataDescription, name: string, args: any): ITableLoader;
}

export function adapterOne2Two(loader: ITableLoader): ITableLoader2 {
  return {
    rowIds: (desc: ITableDataDescription, range: Range) => loader(desc).then((d) => range.preMultiply(d.rowIds, desc.size)),
    rows: (desc: ITableDataDescription, range: Range) => loader(desc).then((d) => range.dim(0).filter(d.rows, desc.size[0])),
    col: (desc: ITableDataDescription, column: string, range: Range) => loader(desc).then((d) => range.filter(d.objs.map((d) => d[column]), desc.size)),
    objs: (desc: ITableDataDescription, range: Range) => loader(desc).then((d) => range.filter(d.objs, desc.size)),
    data: (desc: ITableDataDescription, range: Range) => loader(desc).then((d) => range.filter(toFlat(d.objs, desc.columns), desc.size)),
    view: (desc: ITableDataDescription, name: string, args: any) => {
      throw new Error('not implemented');
    }
  };
}


export function viaAPIViewLoader(name: string, args: IQueryArgs): ITableLoader {
  let _loader = undefined;
  return (desc) => {
    if (!_loader) { //in the cache
      _loader = getAPIJSON(`/dataset/table/${desc.id}/view/${name}`, args).then((data) => {
        data.rowIds = parse(data.rowIds);
        data.objs = maskObjects(data.data, desc);
        //mask the data
        return data;
      });
    }
    return _loader;
  };
}

function maskCol(arr: IValueType[], col: ITableColumn): IValueType[] {
  //mask data
  if (col.value && 'missing' in col.value && (col.value.type === VALUE_TYPE_INT || col.value.type === VALUE_TYPE_REAL)) {
    return <IValueType[]>mask(arr, <INumberValueTypeDesc>col.value);
  }
  return arr;
}

function maskObjects(arr: IValueType[], desc: ITableDataDescription) {
  //mask data
  const maskAble = desc.columns.filter((col) => col.value && 'missing' in col.value && (col.value.type === VALUE_TYPE_INT || col.value.type === VALUE_TYPE_REAL));
  if (maskAble.length > 0) {
    arr.forEach((row) => {
      maskAble.forEach((col) => row[col.name] = mask(row[col.name], <INumberValueTypeDesc>col.value));
    });
  }
  return arr;
}


export function viaAPI2Loader(): ITableLoader2 {
  let rowIds = null,
    rows = null,
    cols: any = {},
    objs = null,
    data = null;
  const r: ITableLoader2 = {
    rowIds: (desc: ITableDataDescription, range: Range) => {
      if (rowIds == null) {
        rowIds = getAPIJSON(`/dataset/table/${desc.id}/rowIds`).then(parse);
      }
      return rowIds.then((d) => d.preMultiply(range, desc.size));
    },
    rows: (desc: ITableDataDescription, range: Range) => {
      if (rows == null) {
        rows = getAPIJSON(`/dataset/table/${desc.id}/rows`);
      }
      return rows.then((d) => range.dim(0).filter(d, desc.size[0]));
    },
    objs: (desc: ITableDataDescription, range: Range) => {
      if (range.isAll) {
        if (objs == null) {
          objs = getAPIJSON(`/dataset/table/${desc.id}/raw`).then((data) => maskObjects(data, desc));
        }
        return objs;
      }
      if (objs != null) { //already loading all
        return objs.then((d) => range.filter(d, desc.size));
      }
      //server side slicing
      return getAPIData(`/dataset/table/${desc.id}/raw`, {range: range.toString()}).then((data) => maskObjects(data, desc));
    },
    data: (desc: ITableDataDescription, range: Range) => {
      if (range.isAll) {
        if (data == null) {
          data = r.objs(desc, range).then((objs) => toFlat(objs, desc.columns));
        }
        return data;
      }
      if (data != null) { //already loading all
        return data.then((d) => range.filter(d, desc.size));
      }
      //server side slicing
      return r.objs(desc, range).then((objs) => toFlat(objs, desc.columns));
    },
    col: (desc: ITableDataDescription, column: string, range: Range) => {
      const colDesc = (<any>desc).columns.find((c: any) => c.name === column);
      if (range.isAll) {
        if (cols[column] == null) {
          if (objs === null) {
            cols[column] = getAPIJSON(`/dataset/table/${desc.id}/col/${column}`).then((data) => mask(data, colDesc));
          } else {
            cols[column] = objs.then((objs) => objs.map((row) => row[column]));
          }
        }
        return cols[column];
      }
      if (cols[column] != null) { //already loading all
        return cols[column].then((d) => range.filter(d, (<any>desc).size));
      }
      //server side slicing
      return getAPIData(`/dataset/table/${desc.id}/col/${column}`, {range: range.toString()}).then((data) => maskCol(data, colDesc));
    },
    view: (desc: ITableDataDescription, name: string, args: IQueryArgs) => viaAPIViewLoader(name, args)
  };
  return r;
}

function toFlat(data: any[][], vecs: ITableColumn[]) {
  return data.map((row) => vecs.map((col) => row[col.name]));
}

// TODO
export function viaDataLoader(data: any[], nameProperty: any) {
  let _data: any = undefined;
  return (desc) => {
    if (_data) { //in the cache
      return Promise.resolve(_data);
    }
    const name: (any) => string = typeof(nameProperty) === 'function' ? nameProperty : (d) => d[nameProperty.toString()];

    function toGetter(col) {
      if (col.getter) {
        return col.getter;
      }
      return (d) => d[col.column || col.name];
    }

    const getters = desc.columns.map(toGetter);
    const objs = data.map((row) => {
      const r = {_: row};
      desc.columns.forEach((col, i) => {
        r[col.name] = getters[i](row);
      });
      return r;
    });
    const rows = data.map(name);
    _data = {
      rowIds: desc.rowassigner ? desc.rowassigner.map(rows) : range(0, data.length),
      rows: rows,
      objs: objs,
      data: getters.map((getter) => data.map(getter))
    };
    return Promise.resolve(_data);
  };
}
