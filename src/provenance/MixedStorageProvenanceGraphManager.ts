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


export class MixedStorageProvenanceGraphManager implements IProvenanceGraphManager {
  private remote:RemoteStorageProvenanceGraphManager;
  private local:LocalStorageProvenanceGraphManager;

  constructor(options = {}) {
    this.remote = new RemoteStorageProvenanceGraphManager(options);
    this.local = new LocalStorageProvenanceGraphManager(options);
  }

  listRemote() {
    return this.remote.list();
  }

  listLocal() {
    return this.local.list();
  }

  list():Promise<IDataDescription[]> {
    return Promise.all([this.listLocal(), this.listRemote()]).then((arr) => arr[0].concat(arr[1]));
  }

  delete(desc:IDataDescription):Promise<boolean> {
    if ((<any>desc).local) {
      return this.local.delete(desc);
    } else {
      return this.remote.delete(desc);
    }
  }

  get(desc:IDataDescription):Promise<ProvenanceGraph> {
    if ((<any>desc).local) {
      return this.local.get(desc);
    } else {
      return this.remote.get(desc);
    }
  }

  getGraph(desc:IDataDescription):Promise<graph.GraphBase> {
    if ((<any>desc).local) {
      return this.local.getGraph(desc);
    } else {
      return this.remote.getGraph(desc);
    }
  }

  cloneLocal(desc:IDataDescription):Promise<ProvenanceGraph> {
    return this.getGraph(desc).then(this.local.clone.bind(this.local));
  }

  importLocal(json:any) {
    return this.local.import(json);
  }

  importRemote(json:any) {
    return this.remote.import(json);
  }

  import(json:any) {
    return this.importLocal(json);
  }

  createLocal() {
    return this.local.create();
  }

  createRemote() {
    return this.remote.create();
  }

  create() {
    return this.createLocal();
  }
}
