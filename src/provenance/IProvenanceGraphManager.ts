/**
 * Created by sam on 12.02.2015.
 */
import {isFunction, constant, argList, mixin, search, hash, resolveIn} from '../index';
import {get as getData, remove as removeData, upload, list as listData} from '../data';
import * as graph from '../graph';
import {IDType, SelectOperation, defaultSelectionType, resolve as resolveIDType} from '../idtype';
import {Range, list as rlist, Range1D, all} from '../range';
import {isDataType, IDataType, IDataDescription, DataTypeBase} from '../datatype';
import {list as listPlugins, load as loadPlugin} from '../plugin';
import * as session from '../session';

export interface IProvenanceGraphManager {
  list(): Promise<IDataDescription[]>;
  get(desc:IDataDescription): Promise<ProvenanceGraph>;
  create(): Promise<ProvenanceGraph>;

  delete(desc:IDataDescription): Promise<boolean>;

  import(json:any): Promise<ProvenanceGraph>;
}
