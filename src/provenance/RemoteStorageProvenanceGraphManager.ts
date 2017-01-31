/**
 * Created by sam on 12.02.2015.
 */
import {mixin} from '../index';
import {get as getData, remove as removeData, upload, list as listData} from '../data';
import ProvenanceGraph, {
  IProvenanceGraphManager,
  provenanceGraphFactory,
  IProvenanceGraphDataDescription
} from './ProvenanceGraph';
import GraphBase from '../graph/GraphBase';
import GraphProxy from '../graph/GraphProxy';
import {retrieve} from '../session';

function getCurrentUser() {
  return retrieve('username', 'Anonymous');
}

export default class RemoteStorageProvenanceGraphManager implements IProvenanceGraphManager {
  private options = {
    application: 'unknown'
  };

  constructor(options = {}) {
    mixin(this.options, options);
  }

  list() {
    return listData((d) => d.desc.type === 'graph' && (<any>d.desc).attrs.graphtype === 'provenance_graph' && (<any>d.desc).attrs.of === this.options.application).then((d) => d.map((di) => di.desc));
  }

  getGraph(desc: IProvenanceGraphDataDescription): Promise<GraphBase> {
    return getData(desc.id).then((graph: GraphProxy) => <any>graph.impl(provenanceGraphFactory()));
  }

  get(desc: IProvenanceGraphDataDescription): Promise<ProvenanceGraph> {
    return this.getGraph(desc).then((impl: GraphBase) => new ProvenanceGraph(desc, impl));
  }

  delete(desc: IProvenanceGraphDataDescription) {
    return removeData(desc);
  }

  import(json: any): Promise<ProvenanceGraph> {
    const desc: any = {
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
      .then((graph: GraphProxy) => graph.impl(provenanceGraphFactory()))
      .then((impl: GraphBase) => new ProvenanceGraph(<IProvenanceGraphDataDescription>impl.desc, impl));
  }

  create() {
    const desc: IProvenanceGraphDataDescription = {
      id: undefined,
      type: 'graph',
      attrs: {
        graphtype: 'provenance_graph',
        of: this.options.application
      },
      name: 'Workspace for ' + this.options.application,
      fqname: 'provenance_graphs/Workspace for ' + this.options.application,
      creator: getCurrentUser(),
      size: [0, 0],
      ts: Date.now(),
      description: ''
    };
    return upload(desc)
      .then((graph: GraphProxy) => graph.impl(provenanceGraphFactory()))
      .then((impl: GraphBase) => new ProvenanceGraph(<IProvenanceGraphDataDescription>impl.desc, impl));
  }
}
