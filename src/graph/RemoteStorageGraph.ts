/**
 * Created by Samuel Gratzl on 22.10.2014.
 */
import {sendAPI} from '../ajax';
import {IEvent} from '../event';
import GraphBase, {IGraphFactory, IGraphDataDescription} from './GraphBase';
import {GraphEdge, GraphNode} from './graph';

export default class RemoteStoreGraph extends GraphBase {
  private updateHandler = (event: IEvent) => {
    const s = event.target;
    if (s instanceof GraphNode) {
      this.updateNode(<GraphNode>s);
    }
    if (s instanceof GraphEdge) {
      this.updateEdge(<GraphEdge>s);
    }
  };

  private waitForSynced = 0;


  constructor(desc: IGraphDataDescription, nodes: GraphNode[] = [], edges: GraphEdge[] = []) {
    super(desc, nodes, edges);
  }

  static load(desc, factory: IGraphFactory) {
    const r = new RemoteStoreGraph(desc);
    return r.load(factory);
  }

  private load(factory: IGraphFactory) {
    return sendAPI(`/dataset/graph/${this.desc.id}/data`).then((r) => {
      this.loadImpl(r.nodes, r.edges, factory);
      this.fire('sync_load,sync', --this.waitForSynced);
      return this;
    });
  }

  private loadImpl(nodes: any[], edges: any[], factory: IGraphFactory) {
    const lookup = {},
      lookupFun = (id) => lookup[id];
    nodes.forEach((n) => {
      let nn = factory.makeNode(n);
      lookup[nn.id] = nn;
      nn.on('setAttr', this.updateHandler);
      super.addNode(nn);
    });
    edges.forEach((n) => {
      let nn = factory.makeEdge(n, lookupFun);
      nn.on('setAttr', this.updateHandler);
      super.addEdge(nn);
    });
    this.fire('loaded');
  }

  get activeSyncOperations() {
    return this.waitForSynced;
  }

  addNode(n: GraphNode): this|Promise<this> {
    super.addNode(n);
    n.on('setAttr', this.updateHandler);

    this.fire('sync_start_node,sync_start', ++this.waitForSynced, 'add_node', n);
    return sendAPI(`/dataset/graph/${this.desc.id}/node`, {
      desc: JSON.stringify(n.persist())
    }, 'POST').then((r) => {
      this.fire('sync_node,sync', --this.waitForSynced, n);
      return this;
    });
  }

  updateNode(n: GraphNode): this|Promise<this> {
    super.updateNode(n);
    this.fire('sync_start_node,sync_start', ++this.waitForSynced, 'update_node', n);
    return sendAPI(`/dataset/graph/${this.desc.id}/node/${n.id}`, {
      desc: JSON.stringify(n.persist())
    }, 'PUT').then((r) => {
      this.fire('sync_node,sync', --this.waitForSynced, n);
      return this;
    });
  }

  removeNode(n: GraphNode): this|Promise<this> {
    if (!super.removeNode(n)) {
      return Promise.reject('invalid node');
    }
    n.off('setAttr', this.updateHandler);
    this.fire('sync_start_node,sync_start', ++this.waitForSynced, 'remove_node', n);
    return sendAPI(`/dataset/graph/${this.desc.id}/node/${n.id}`, {}, 'DELETE').then((r) => {
      this.fire('sync_node,sync', --this.waitForSynced, n);
      return this;
    });
  }

  addEdge(e_or_s: GraphEdge | GraphNode, type?: string, t?: GraphNode): this|Promise<this> {
    if (e_or_s instanceof GraphEdge) {
      super.addEdge(e_or_s);
      let e = <GraphEdge>e_or_s;
      e.on('setAttr', this.updateHandler);
      this.fire('sync_start_edge,sync_start', ++this.waitForSynced, 'add_edge', e);
      return sendAPI(`/dataset/graph/${this.desc.id}/edge`, {
        desc: JSON.stringify(e.persist())
      }, 'POST').then((r) => {
        this.fire('sync_edge,sync', --this.waitForSynced, e);
        return this;
      });
    }
    return super.addEdge(<GraphNode>e_or_s, type, t);
  }

  removeEdge(e: GraphEdge): this|Promise<this> {
    if (!super.removeEdge(e)) {
      return Promise.reject('invalid edge');
    }
    e.off('setAttr', this.updateHandler);
    this.fire('sync_start_edge,sync_start', ++this.waitForSynced, 'remove_edge', e);
    return sendAPI(`/dataset/graph/${this.desc.id}/edge/${e.id}`, {}, 'DELETE').then((r) => {
      this.fire('sync_edge,sync', --this.waitForSynced, e);
      return this;
    });
  }

  updateEdge(e: GraphEdge): this|Promise<this> {
    super.updateEdge(e);
    this.fire('sync_start_edge,sync_start', ++this.waitForSynced, 'update_edge', e);
    return sendAPI(`/dataset/graph/${this.desc.id}/edge/${e.id}`, {
      desc: JSON.stringify(e.persist())
    }, 'PUT').then((r) => {
      this.fire('sync_edge,sync', --this.waitForSynced, e);
      return this;
    });
  }

  clear() {
    if (this.nnodes === 0 && this.nedges === 0) {
      return Promise.resolve(this);
    }
    this.nodes.forEach((n) => n.off('setAttr', this.updateHandler));
    this.edges.forEach((n) => n.off('setAttr', this.updateHandler));
    super.clear();
    this.fire('sync_start', ++this.waitForSynced, 'clear');
    //clear all nodes
    return sendAPI(`/dataset/graph/${this.desc.id}/node`, {}, 'DELETE').then((r) => {
      this.fire('sync');
      return this;
    });
  }
}
