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


export class RemoteStorageProvenanceGraphManager implements IProvenanceGraphManager {
  private options = {
    application: 'unknown'
  };

  constructor(options = {}) {
    mixin(this.options, options);
  }

  list() {
    return listData((d) => d.desc.type === 'graph' && (<any>d.desc).attrs.graphtype === 'provenance_graph' && (<any>d.desc).attrs.of === this.options.application).then((d) => d.map((di) => di.desc));
  }

  getGraph(desc:IDataDescription):Promise<graph.GraphBase> {
    return getData(desc.id)
      .then((graph:graph.GraphProxy) => graph.impl(provenanceGraphFactory()));
  }

  get(desc:IDataDescription):Promise<ProvenanceGraph> {
    return this.getGraph(desc).then((impl:graph.GraphBase) => new ProvenanceGraph(desc, impl));
  }

  delete(desc:IDataDescription) {
    return removeData(desc);
  }

  import(json:any):Promise<ProvenanceGraph> {
    const desc = {
      type: 'graph',
      attrs: {
        graphtype: 'provenance_graph',
        of: this.options.application
      },
      name: 'Workspace for ' + this.options.application,
      creator: getCurrentUser(),
      ts: Date.now(),
      description: '',

      nodes: json.nodes,
      edges: json.edges
    };
    return upload(desc)
      .then((graph:graph.GraphProxy) => graph.impl(provenanceGraphFactory()))
      .then((impl:graph.GraphBase) => new ProvenanceGraph(impl.desc, impl));
  }

  create() {
    const desc = {
      type: 'graph',
      attrs: {
        graphtype: 'provenance_graph',
        of: this.options.application
      },
      name: 'Workspace for ' + this.options.application,
      creator: getCurrentUser(),
      ts: Date.now(),
      description: ''
    };
    return upload(desc)
      .then((graph:graph.GraphProxy) => graph.impl(provenanceGraphFactory()))
      .then((impl:graph.GraphBase) => new ProvenanceGraph(impl.desc, impl));
  }
}
