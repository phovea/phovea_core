/**
 * Created by sam on 12.02.2015.
 */
import {IDataDescription} from '../datatype';
import ProvenanceGraph, {IProvenanceGraphManager, IProvenanceGraphDataDescription} from './ProvenanceGraph';
import LocalStorageProvenanceGraphManager from './LocalStorageProvenanceGraphManager';
import RemoteStorageProvenanceGraphManager from './RemoteStorageProvenanceGraphManager';
import GraphBase from '../graph/GraphBase';
import {IGraphDataDescription} from "../graph/GraphBase";

export default class MixedStorageProvenanceGraphManager implements IProvenanceGraphManager {
  private remote: RemoteStorageProvenanceGraphManager;
  private local: LocalStorageProvenanceGraphManager;

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

  list(): Promise<IProvenanceGraphDataDescription[]> {
    return Promise.all([this.listLocal(), this.listRemote()]).then((arr) => arr[0].concat(arr[1]));
  }

  delete(desc: IProvenanceGraphDataDescription): Promise<boolean> {
    if ((<any>desc).local) {
      return this.local.delete(desc);
    } else {
      return this.remote.delete(desc);
    }
  }

  get(desc: IProvenanceGraphDataDescription): Promise<ProvenanceGraph> {
    if ((<any>desc).local) {
      return this.local.get(desc);
    } else {
      return this.remote.get(desc);
    }
  }

  getGraph(desc: IProvenanceGraphDataDescription): Promise<GraphBase> {
    if (desc.local) {
      return this.local.getGraph(desc);
    } else {
      return this.remote.getGraph(desc);
    }
  }

  cloneLocal(desc: IProvenanceGraphDataDescription): Promise<ProvenanceGraph> {
    return this.getGraph(desc).then((g) => this.local.clone(g));
  }

  importLocal(json: any) {
    return this.local.import(json);
  }

  importRemote(json: any) {
    return this.remote.import(json);
  }

  import(json: any) {
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
