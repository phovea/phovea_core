/**
 * Created by sam on 12.02.2015.
 */
import {mixin} from '../index';
import ProvenanceGraph, {
  IProvenanceGraphManager,
  provenanceGraphFactory,
  IProvenanceGraphDataDescription
} from './ProvenanceGraph';
import GraphBase from '../graph/GraphBase';
import LocalStorageGraph from '../graph/LocalStorageGraph';
import {currentUserNameOrAnonymous} from '../security';

export default class LocalStorageProvenanceGraphManager implements IProvenanceGraphManager {
  private options = {
    storage: localStorage,
    prefix: 'clue',
    application: 'unknown'
  };

  constructor(options = {}) {
    mixin(this.options, options);
  }

  list() {
    const lists : string[] = JSON.parse(this.options.storage.getItem(this.options.prefix + '_provenance_graphs') || '[]');
    const l = lists.map((id) => JSON.parse(this.options.storage.getItem(this.options.prefix + '_provenance_graph.' + id)));
    return Promise.resolve(l);
  }


  getGraph(desc: IProvenanceGraphDataDescription): Promise<LocalStorageGraph> {
    return Promise.resolve(LocalStorageGraph.load(desc, provenanceGraphFactory(), this.options.storage));
  }

  async get(desc: IProvenanceGraphDataDescription): Promise<ProvenanceGraph> {
    return new ProvenanceGraph(desc, await this.getGraph(desc));
  }

  async clone(graph: GraphBase, desc: any = {}): Promise<ProvenanceGraph> {
    const pdesc = this.createDesc(desc);
    const newGraph = await this.getGraph(pdesc);
    newGraph.restoreDump(graph.persist(), provenanceGraphFactory());
    return new ProvenanceGraph(pdesc, newGraph);
  }

  async import(json: any, desc: any = {}): Promise<ProvenanceGraph> {
    const pdesc = this.createDesc(desc);
    const newGraph = await this.getGraph(pdesc);
    newGraph.restoreDump(json, provenanceGraphFactory());
    return new ProvenanceGraph(pdesc, newGraph);
  }

  delete(desc: IProvenanceGraphDataDescription) {
    const lists = JSON.parse(this.options.storage.getItem(this.options.prefix + '_provenance_graphs') || '[]');
    lists.splice(lists.indexOf(desc.id), 1);
    LocalStorageGraph.delete(desc);
    //just remove from the list
    this.options.storage.setItem(this.options.prefix + '_provenance_graphs', JSON.stringify(lists));
    return Promise.resolve(true);
  }

  private createDesc(overrides: any = {}) {
    const lists: string[] = JSON.parse(this.options.storage.getItem(this.options.prefix + '_provenance_graphs') || '[]');
    const id = this.options.prefix + (lists.length > 0 ? String(1 + Math.max(...lists.map((d) => parseInt(d.slice(this.options.prefix.length), 10)))) : '0');
    const desc: IProvenanceGraphDataDescription = mixin({
      type: 'provenance_graph',
      name: 'Local Workspace#' + id,
      fqname: this.options.prefix + '.Provenance Graph #' + id,
      id,
      local: true,
      size: <[number, number]>[0, 0],
      attrs: {
        graphtype: 'provenance_graph',
        of: this.options.application
      },
      creator: currentUserNameOrAnonymous(),
      ts: Date.now(),
      description: ''
    }, overrides);
    lists.push(id);
    this.options.storage.setItem(this.options.prefix + '_provenance_graphs', JSON.stringify(lists));
    this.options.storage.setItem(this.options.prefix + '_provenance_graph.' + id, JSON.stringify(desc));
    return desc;
  }

  create(desc: any = {}) {
    const pdesc = this.createDesc(desc);
    return this.get(pdesc);
  }
}
