/**
 * Created by sam on 12.02.2015.
 */
import {mixin} from '../index';
import ProvenanceGraph, {
  IProvenanceGraphManager,
  provenanceGraphFactory,
  IProvenanceGraphDataDescription
} from './ProvenanceGraph';
import {retrieve} from '../session';
import GraphBase from '../graph/GraphBase';
import LocalStorageGraph from '../graph/LocalStorageGraph';

function getCurrentUser() {
  return retrieve('username', 'Anonymous');
}

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

  async clone(graph: GraphBase): Promise<ProvenanceGraph> {
    const desc = this.createDesc();
    const newGraph = await this.getGraph(desc);
    newGraph.restoreDump(graph.persist(), provenanceGraphFactory());
    return new ProvenanceGraph(desc, newGraph);
  }

  async import(json: any): Promise<ProvenanceGraph> {
    const desc = this.createDesc();
    const newGraph = await this.getGraph(desc);
    newGraph.restoreDump(json, provenanceGraphFactory());
    return new ProvenanceGraph(desc, newGraph);
  }

  delete(desc: IProvenanceGraphDataDescription) {
    const lists = JSON.parse(this.options.storage.getItem(this.options.prefix + '_provenance_graphs') || '[]');
    lists.splice(lists.indexOf(desc.id), 1);
    LocalStorageGraph.delete(desc);
    //just remove from the list
    this.options.storage.setItem(this.options.prefix + '_provenance_graphs', JSON.stringify(lists));
    return Promise.resolve(true);
  }

  private createDesc() {
    const lists: string[] = JSON.parse(this.options.storage.getItem(this.options.prefix + '_provenance_graphs') || '[]');
    const id = this.options.prefix + (lists.length > 0 ? String(1 + Math.max(...lists.map((d) => parseInt(d.slice(this.options.prefix.length), 10)))) : '0');
    const desc: IProvenanceGraphDataDescription = {
      type: 'provenance_graph',
      name: 'Local Workspace#' + id,
      fqname: this.options.prefix + '.Provenance Graph #' + id,
      id,
      local: true,
      size: [0, 0],
      attrs: {
        graphtype: 'provenance_graph',
        of: this.options.application
      },
      creator: getCurrentUser(),
      ts: Date.now(),
      description: ''
    };
    lists.push(id);
    this.options.storage.setItem(this.options.prefix + '_provenance_graphs', JSON.stringify(lists));
    this.options.storage.setItem(this.options.prefix + '_provenance_graph.' + id, JSON.stringify(desc));
    return desc;
  }

  create() {
    const desc = this.createDesc();
    return this.get(desc);
  }
}
