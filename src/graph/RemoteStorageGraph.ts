/**
 * Created by Samuel Gratzl on 22.10.2014.
 */
import {sendAPI} from '../ajax';
import {IDataDescription} from '../datatype';
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

  private _wait_for_synced = 0;


  constructor(desc: IGraphDataDescription, _nodes: GraphNode[] = [], _edges: GraphEdge[] = []) {
    super(desc, _nodes, _edges);
  }

  static load(desc, factory: IGraphFactory) {
    const r = new RemoteStoreGraph(desc, [], []);
    return r.load(factory);
  }

  private load(factory: IGraphFactory) {
    return sendAPI('/dataset/graph/' + this.desc.id + '/data').then((r) => {
      this.loadImpl(r.nodes, r.edges, factory);
      this.fire('sync_load,sync', --this._wait_for_synced);
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
    return this._wait_for_synced;
  }

  addNode(n: GraphNode) {
    super.addNode(n);
    n.on('setAttr', this.updateHandler);

    this.fire('sync_start_node,sync_start', ++this._wait_for_synced, 'add_node', n);
    return sendAPI('/dataset/graph/' + this.desc.id + '/node', {
      desc: JSON.stringify(n.persist())
    }, 'post').then((r) => {
      this.fire('sync_node,sync', --this._wait_for_synced, n);
      return this;
    });
  }

  updateNode(n: GraphNode): any {
    super.updateNode(n);
    this.fire('sync_start_node,sync_start', ++this._wait_for_synced, 'update_node', n);
    return sendAPI('/dataset/graph/' + this.desc.id + '/node/' + n.id, {
      desc: JSON.stringify(n.persist())
    }, 'put').then((r) => {
      this.fire('sync_node,sync', --this._wait_for_synced, n);
      return this;
    });
  }

  removeNode(n: GraphNode) {
    if (!super.removeNode(n)) {
      return Promise.reject('invalid node');
    }
    n.off('setAttr', this.updateHandler);
    this.fire('sync_start_node,sync_start', ++this._wait_for_synced, 'remove_node', n);
    return sendAPI('/dataset/graph/' + this.desc.id + '/node/' + n.id, {}, 'delete').then((r) => {
      this.fire('sync_node,sync', --this._wait_for_synced, n);
      return this;
    });
  }

  addEdge(e_or_s: GraphEdge | GraphNode, type?: string, t?: GraphNode) {
    if (e_or_s instanceof GraphEdge) {
      super.addEdge(e_or_s);
      let e = <GraphEdge>e_or_s;
      e.on('setAttr', this.updateHandler);
      this.fire('sync_start_edge,sync_start', ++this._wait_for_synced, 'add_edge', e);
      return sendAPI('/dataset/graph/' + this.desc.id + '/edge', {
        desc: JSON.stringify(e.persist())
      }, 'post').then((r) => {
        this.fire('sync_edge,sync', --this._wait_for_synced, e);
        return this;
      });
    }
    return super.addEdge(<GraphNode>e_or_s, type, t);
  }

  removeEdge(e: GraphEdge) {
    if (!super.removeEdge(e)) {
      return Promise.reject('invalid edge');
    }
    e.off('setAttr', this.updateHandler);
    this.fire('sync_start_edge,sync_start', ++this._wait_for_synced, 'remove_edge', e);
    return sendAPI('/dataset/graph/' + this.desc.id + '/edge/' + e.id, {}, 'delete').then((r) => {
      this.fire('sync_edge,sync', --this._wait_for_synced, e);
      return this;
    });
  }

  updateEdge(e: GraphEdge): any {
    super.updateEdge(e);
    this.fire('sync_start_edge,sync_start', ++this._wait_for_synced, 'update_edge', e);
    return sendAPI('/dataset/graph/' + this.desc.id + '/edge/' + e.id, {
      desc: JSON.stringify(e.persist())
    }, 'put').then((r) => {
      this.fire('sync_edge,sync', --this._wait_for_synced, e);
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
    this.fire('sync_start', ++this._wait_for_synced, 'clear');
    return sendAPI('/dataset/graph/' + this.desc.id + '/node', {}, 'delete').then((r) => {
      this.fire('sync');
      return this;
    });
  }
}
