import {IDataType} from '../datatype';
import {randomId} from '../index';
import {ITable} from '../table';
import {wrapObjects} from '../table/Table';
import {list} from '../data';
/**
 * utility to convert a list of datatypes to a table compatible datatype object
 * @param list
 * @returns {any}
 */
export function convertToTable(list: IDataType[]) {
  return wrapObjects({
    id: '_data' + randomId(5),
    name: 'data',
    description: 'list of data types',
    fqname: 'custom/data',
    creator: 'Anonymous',
    ts: Date.now(),
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
export async function listAsTable(tablesAsVectors = false) {
  let l = await list();
  if (tablesAsVectors) {
    l = convertTableToVectors(l);
  }
  return convertToTable(l);
}
