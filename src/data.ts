/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */
import {offline as isOffline, fixId, randomId} from './index';
import {getAPIJSON, sendAPI} from './ajax';
import {list as listPlugins} from './plugin';
import {IDataDescription, IDataType, DataTypeBase} from './datatype';
import {ITable} from './table';
import {wrapObjects} from './table_impl';
export {random_id, fixId} from './index';

//find all datatype plugins
const available = listPlugins('datatype');

const cacheById = new Map<string, Promise<IDataType>>();
const cacheByName = new Map<string, Promise<IDataType>>();
const cacheByFQName = new Map<string, Promise<IDataType>>();

export function clearCache(dataset?: IDataType | IDataDescription) {
  if (dataset) {
    const desc: IDataDescription = (<IDataType>dataset).desc || dataset;
    cacheById.delete(desc.id);
    cacheByName.delete(desc.name);
    cacheByFQName.delete(desc.fqname);
  } else {
    cacheById.clear();
    cacheByName.clear();
    cacheByFQName.clear();
  }
}

function getCachedEntries(): Promise<IDataType[]> {
  return Promise.all(Array.from(cacheById.values()));
}

function cached(desc: IDataDescription, result: Promise<IDataType>) {
  cacheById.set(desc.id, result);
  cacheByFQName.set(desc.fqname, result);
  cacheByName.set(desc.name, result);
  return result;
}

/**
 * create an object out of a description
 * @param desc
 * @returns {*}
 */
function transformEntry(desc: IDataDescription): Promise<IDataType> {
  if (desc === undefined) {
    return null;
  }
  desc.id = desc.id || fixId(desc.name + randomId(5));
  desc.fqname = desc.fqname || desc.name;

  if (cacheById.has(desc.id)) {
    return cacheById.get(desc.id);
  }

  //find matching type
  const plugin = available.filter((p) => p.id === desc.type);
  //no type there create a dummy one
  if (plugin.length === 0) {
    return cached(desc, Promise.resolve(new DataTypeBase(desc)));
  }
  //take the first matching one
  return cached(desc, plugin[0].load().then((p) => p.factory(desc)));
}

/**
 * returns a promise for getting a map of all available data
 * @param filter optional filter either a function or a server side interpretable filter object
 * @returns {Promise<IDataType[]>}
 */
export function list(filter?: ({[key: string]: string})|((d: IDataType) => boolean)): Promise<IDataType[]> {
  const f = (typeof filter === 'function') ? <(d: IDataType) => boolean>query : null;
  const q = (typeof filter !== 'undefined' && typeof filter !== 'function') ? <any>query : {};

  let r: Promise<IDataType[]>;

  if (isOffline) {
    r = getCachedEntries();
  } else {
    //load descriptions and create data out of them
    r = getAPIJSON('/dataset/', q)
      .then((descs: IDataDescription[]) => Promise.all(descs.map(transformEntry)));
  }

  if (f !== null) {
    r = r.then((arr) => arr.filter(f));
  }
  return r;
}

export interface INode {
  readonly name: string;
  readonly children: INode[];
  readonly data: IDataType;
}

/**
 * converts a given list of datasets to a tree
 * @param list
 * @returns {{children: Array, name: string, data: null}}
 */
export function convertToTree(list: IDataType[]): INode {
  //create a tree out of the list by the fqname
  const root = {children: [], name: '/', data: null};

  list.forEach((entry) => {
    const path = entry.desc.fqname.split('/');
    let act = root;
    path.forEach((node) => {
      let next = act.children.find((d) => d.name === node);
      if (!next) {
        next = {children: [], name: node, data: null};
        act.children.push(next);
      }
      act = next;
    });
    act.data = entry;
  });

  return root;
}

/**
 * returns a tree of all available datasets
 */
export function tree(filter?: ({[key: string]: string})|((d: IDataType) => boolean)): Promise<INode> {
  return list(filter).then(convertToTree);
}

/**
 * returns the first dataset matching the given query
 * @param query
 * @returns {any}
 */
export function getFirst(query: {[key: string]: string} | string | RegExp): Promise<IDataType> {
  if (typeof query === 'string' || query instanceof RegExp) {
    return getFirstByName(<string|RegExp>query);
  }
  query.limit = 1;
  return list(query).then<IDataType>((result) => {
    if (result.length === 0) {
      return Promise.reject({error: 'nothing found, matching', args: query});
    }
    return Promise.resolve(result[0]);
  });
}

/*function escapeRegExp(string){
 return string.replace(/([.*+?^${}()|\[\]\/\\])/g, '\\$1');
 }*/

export function getFirstByName(name: string | RegExp) {
  return getFirstWithCache(name, cacheByName, 'name');
}
export function getFirstByFQName(name: string | RegExp) {
  return getFirstWithCache(name, cacheByFQName, 'fqname');
}

function getFirstWithCache(name: string | RegExp, cache: Map<string, Promise<IDataType>>, attr: string) {
  for (let [k, v] of cache.entries()) {
    if (k.match(name) != null) {
      return v;
    }
  }
  return getFirst({
    [attr]: typeof name === 'string' ? name : name.source
  });
}

function getById(id: string) {
  if (cacheById.has(id)) {
    return cacheById.get(id);
  }
  return getAPIJSON(`/dataset/${id}/desc`).then(transformEntry);
}

/**
 * returns a promise for getting a specific dataset
 * @param persisted an id or persisted object containing the id
 * @returns {Promise<IDataType>}
 */
export function get(persisted: any | string): Promise<IDataType> {
  if (typeof persisted === 'string') {
    return getById(<string>persisted);
  }
  //resolve parent and then resolve it using restore item
  if (persisted.root) {
    return get(persisted.root).then((parent) => parent ? parent.restore(persisted) : null);
  } else {
    //can't restore non root and non data id
    return Promise.reject('cannot restore non root and non data id');
  }
}

/**
 * creates a new dataset for the given description
 * @param desc
 * @returns {Promise<IDataType>}
 */
export function create(desc: IDataDescription): Promise<IDataType> {
  return transformEntry(desc);
}

function prepareData(desc: IDataDescription, file?: File) {
  const data = new FormData();
  data.append('desc', JSON.stringify(desc));
  if (file) {
    data.append('file', file);
  }
  return data;
}

/**
 * uploads a given dataset description with optional file attachment ot the server
 * @param desc
 * @param file
 * @returns {Promise<*>}
 */
export function upload(desc: IDataDescription, file?: File): Promise<IDataType> {
  const data = prepareData(desc, file);
  return sendAPI('/dataset/', data, 'POST').then(transformEntry);
}

/**
 * updates an existing dataset with a new description and optional file
 * @param entry
 * @param desc
 * @param file
 * @returns {Promise<*>} returns the update dataset
 */
export function update(entry: IDataType, desc: IDataDescription, file?: File): Promise<IDataType> {
  const data = prepareData(desc, file);
  return sendAPI(`/dataset/${entry.desc.id}`, data, 'PUT').then((desc: IDataDescription) => {
    // clear existing cache
    clearCache(entry);
    //update with current one
    return transformEntry(desc);
  });
}

/**
 * modifies an existing dataset with a new description and optional file, the difference to update is that this should be used for partial changes
 * @param entry
 * @param desc
 * @param file
 * @returns {Promise<*>} returns the update dataset
 */
export function modify(entry: IDataType, desc: IDataDescription, file?: File): Promise<IDataType> {
  const data = prepareData(desc, file);
  return sendAPI(`/dataset/${entry.desc.id}`, data, 'POST').then((desc: IDataDescription) => {
    clearCache(entry);
    return transformEntry(desc);
  });
}

/**
 * removes a given dataset
 * @param entry
 * @returns {Promise<boolean>}
 */
export function remove(entry: IDataType | IDataDescription): Promise<Boolean> {
  const desc: IDataDescription = (<IDataType>entry).desc || entry;
  return sendAPI(`/dataset/${desc.id}`, {}, 'DELETE').then(() => {
    clearCache(desc);
    return true;
  });
}

/**
 * utility to convert a list of datatypes to a table compatible datatype object
 * @param list
 * @returns {any}
 */
export function convertToTable(list: IDataType[]) {
  return wrapObjects({
    id: '_data',
    name: 'data',
    fqname: 'custom/data',
    type: 'table',
    idtype: '_data',
    size: [list.length, 4],
    columns: [
      {
        name: 'Name',
        value: {
          type: 'string'
        },
        getter: (d) => d.desc.name
      },
      {
        name: 'Type',
        value: {
          type: 'string'
        },
        getter: (d) => d.desc.type
      },
      {
        name: 'Dimensions',
        value: {
          type: 'string'
        },
        getter: (d) => d.dim.join(' x ')
      },
      {
        name: 'ID Types',
        value: {
          type: 'string'
        },
        getter: (d) => d.idtypes.join(' x ')
      },
    ]
  }, list, (d: IDataType) => d.desc.name);
}

/**
 * utility function converting all contained tables in their vectors of individual columns
 * @param list
 * @returns {IDataType[]}
 */
export function convertTableToVectors(list: IDataType[]) {
  const r: IDataType[] = [];
  list.forEach((d) => {
    if (d.desc.type === 'table') {
      r.push(...(<ITable>d).cols());
    } else {
      r.push(d);
    }
  });
  return r;
}

/**
 * lists all datasets and converts them to a table
 * @param tablesAsVectors whether tables should be converted to individual vectors
 * @returns {Promise<*>}
 */
export function listAsTable(tablesAsVectors = false) {
  let l = list();
  if (tablesAsVectors) {
    l = l.then(convertTableToVectors);
  }
  return l.then(convertToTable);
}
