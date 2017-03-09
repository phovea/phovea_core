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
import {currentUserNameOrAnonymous} from '../security';

export default class RemoteStorageProvenanceGraphManager implements IProvenanceGraphManager {
  private options = {
    application: 'unknown'
  };

  constructor(options = {}) {
    mixin(this.options, options);
  }

  async list() {
    return (await listData((d) => d.desc.type === 'graph' && (<any>d.desc).attrs.graphtype === 'provenance_graph' && (<any>d.desc).attrs.of === this.options.application)).map((di) => di.desc);
  }

  async getGraph(desc: IProvenanceGraphDataDescription): Promise<GraphBase> {
    return (<any>(await getData(desc.id))).impl(provenanceGraphFactory());
  }

  async get(desc: IProvenanceGraphDataDescription): Promise<ProvenanceGraph> {
    return new ProvenanceGraph(desc, await this.getGraph(desc));
  }

  delete(desc: IProvenanceGraphDataDescription) {
    return removeData(desc);
  }

  async clone(graph: GraphBase, desc: any = {}): Promise<ProvenanceGraph> {
    return this.import(graph.persist(), desc);
  }

  async import(json: any, desc: any = {}): Promise<ProvenanceGraph> {
    const pdesc: any = mixin({
      type: 'graph',
      attrs: {
        graphtype: 'provenance_graph',
        of: this.options.application
      },
      name: 'Workspace for ' + this.options.application,
      creator: currentUserNameOrAnonymous(),
      ts: Date.now(),
      description: '',

      nodes: json.nodes,
      edges: json.edges
    }, desc);
    const impl: Promise<GraphBase> = (<any>(await upload(pdesc))).impl(provenanceGraphFactory());
    return impl.then((i) => new ProvenanceGraph(<IProvenanceGraphDataDescription>i.desc, i));
  }

  async create(desc: any = {}) {
    const pdesc: IProvenanceGraphDataDescription = mixin({
      id: undefined,
      type: 'graph',
      attrs: {
        graphtype: 'provenance_graph',
        of: this.options.application
      },
      name: 'Workspace for ' + this.options.application,
      fqname: 'provenance_graphs/Workspace for ' + this.options.application,
      creator: currentUserNameOrAnonymous(),
      size: <[number, number]>[0, 0],
      ts: Date.now(),
      description: ''
    }, desc);

    const impl: Promise<GraphBase> = (<any>(await upload(pdesc))).impl(provenanceGraphFactory());
    return impl.then((i) => new ProvenanceGraph(<IProvenanceGraphDataDescription>i.desc, i));
  }
}
