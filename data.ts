/**
 * Created by Samuel Gratzl on 04.08.2014.
 */
import C = require('./main');
import plugins = require('./plugin');
import datatypes = require('./datatype');
import tables = require('./table');
import tables_impl = require('./table_impl');

'use strict';

//find all datatype plugins
var available = plugins.list('datatype');
/**
 * load all descriptions and store them in a promise
 * @type {C.IPromise<datatypes.IDataType[]>}
 */
var loader : C.IPromise<datatypes.IDataType[]> = C.getAPIJSON('/dataset', {
  ws : C.hash.getProp('ws', '')
}).then(function (descs) {
  //load descriptions and create data out of them
  return <any> C.all(descs.map((desc) => transformEntry(desc))).then((datas) => {
    var r = {};
    datas.forEach((data) => {
      r[data.desc.id] = data;
      r[data.desc.name] = data;
    });
    (<any>datas).byId = r;
    return C.resolved(datas);
  });
});


/**
 * create an object out of a description
 * @param desc
 * @returns {*}
 */
function transformEntry(desc) {
  if (desc === undefined) {
    return desc;
  }

  //find matching type
  var plugin = available.filter((p) => p.id === desc.type);
  //no type there create a dummy one
  if (plugin.length === 0) {
    return new datatypes.DataTypeBase(desc);
  }
  //take the first matching one
  return plugin[0].load().then((p) => {
    return p.factory(desc);
  });
}

/**
 * returns a promise for getting a map of all available data
 * @returns {JQueryPromise<any>}
 */
export function list() {
  return loader;
}
/**
 * returns a promise for getting a specific dataset
 * @param name
 * @returns {JQueryGenericPromise<datatypes.IDatatType>}
 */
export function get(name : string) : C.IPromise<datatypes.IDataType>;
export function get(persisted: any) : C.IPromise<datatypes.IDataType>;
export function get(persisted: any) : C.IPromise<datatypes.IDataType> {
  if (typeof persisted === 'string' || typeof persisted === 'number') {
    return list().then(function (data) {
      return (<any>data).byId[persisted];
    });
  }
  //resolve parent and then resolve it using restore item
  if (persisted.root) {
    return get(persisted.root).then((parent) => {
      return parent ? parent.restore(persisted) : null;
    });
  } else {
    //can't restore non root and non data id
    return C.resolved(null);
  }
}

export function create(desc: any) : C.IPromise<datatypes.IDataType> {
  return transformEntry(desc);
}

export function convertToTable(list : datatypes.IDataType[]) {
  return tables_impl.wrapObjects({
    id : '_data',
    name: 'data',
    type: 'table',
    rowtype: '_data',
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
  }, list, (d : datatypes.IDataType) => d.desc.name);
}

export function convertTableToVectors(list: datatypes.IDataType[]) {
  var r = new Array<datatypes.IDataType>();
  list.forEach((d) => {
    if (d.desc.type === 'table') {
      r.push.apply(r, (<tables.ITable>d).cols());
    } else {
      r.push(d);
    }
  });
  return r;
}

export function listAsTable(tablesAsVectors = false) {
  var l = list();
  if (tablesAsVectors) {
    l = l.then(convertTableToVectors);
  }
  return l.then(convertToTable);
}
