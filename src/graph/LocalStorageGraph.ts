/**
 * Created by sam on 12.02.2015.
 */
/**
 * Created by Samuel Gratzl on 22.10.2014.
 */
import {IDataDescription} from '../datatype';
import {IEvent} from '../event';
import GraphBase, {IGraphFactory} from './GraphBase';
import {GraphEdge, GraphNode} from './graph';

export default class LocalStorageGraph extends GraphBase {

  private updateHandler = (event: IEvent) => {
    const s = event.target;
    if (s instanceof GraphNode) {
      this.updateNode(<GraphNode>s);
    }
    if (s instanceof GraphEdge) {
      this.updateEdge(<GraphEdge>s);
    }
  };

  constructor(desc:IDataDescription, _nodes: GraphNode[] = [], _edges:GraphEdge[] = [], private storage: Storage = sessionStorage) {
    super(desc, _nodes, _edges);
  }

  static load(desc, factory: IGraphFactory, storage: Storage = sessionStorage, reset = false) {
    const r = new LocalStorageGraph(desc, [], [], storage);
    if (!reset) {
      r.load(factory);
    }
    return r;
  }

  static clone(graph: GraphBase, factory: IGraphFactory, storage: Storage = sessionStorage) {
    const r = new LocalStorageGraph(graph.desc, [], [], storage);
    r.restoreDump(graph.persist(), factory);
    return r;
  }

  private get uid() {
    return 'graph' + this.desc.id;
  }

  private load(factory: IGraphFactory) {
    const uid = this.uid;
    if (!this.storage.hasOwnProperty(uid+'.nodes')) {
      return;
    }
    const node_ids = JSON.parse(this.storage.getItem(uid+'.nodes'));
    const lookup = {},
      lookupFun = (id) => lookup[id];
    node_ids.forEach((id) => {
      let n = JSON.parse(this.storage.getItem(uid+'.node.'+id));
      let nn = factory.makeNode(n);
      lookup[nn.id] = nn;
      nn.on('setAttr', this.updateHandler);
      super.addNode(nn);
    });
    const edges_ids = JSON.parse(this.storage.getItem(uid+'.edges'));
    edges_ids.forEach((id) => {
      let n = JSON.parse(this.storage.getItem(uid+'.edge.'+id));
      let nn = factory.makeEdge(n, lookupFun);
      nn.on('setAttr', this.updateHandler);
      super.addEdge(nn);
    });
    this.fire('loaded');
  }

  static delete(desc:IDataDescription, storage: Storage = sessionStorage) {
    const uid = 'graph' + desc.id;
    JSON.parse(storage.getItem(uid+'.nodes')).forEach((id) => {
      storage.removeItem(uid+'.node.'+id);
    });
    storage.removeItem(uid+'.nodes');
    JSON.parse(storage.getItem(uid+'.edges')).forEach((id) => {
      storage.removeItem(uid+'.edge.'+id);
    });
    storage.removeItem(uid+'.edges');
    return true;
  }

  restoreDump(persisted:any, factory: IGraphFactory) {
     var lookup = {},
       lookupFun = (id) => lookup[id];

    persisted.nodes.forEach((p) => {
      var n = factory.makeNode(p);
      lookup[n.id] = n;
      this.addNode(n);
    });

    persisted.edges.forEach((p) => {
      var n = factory.makeEdge(p, lookupFun);
      this.addEdge(n);
    });
    return this;
  }

  addNode(n:GraphNode) {
    super.addNode(n);
    const uid = this.uid;
    this.storage.setItem(uid+'.node.'+n.id, JSON.stringify(n.persist()));
    this.storage.setItem(uid+'.nodes',JSON.stringify(this.nodes.map((d) => d.id)));
    n.on('setAttr', this.updateHandler);
    return this;
  }

  updateNode(n: GraphNode): any {
    super.updateNode(n);
    const uid = this.uid;
    this.storage.setItem(uid+'.node.'+n.id, JSON.stringify(n.persist()));
    return this;
  }

  removeNode(n: GraphNode) {
    if (!super.removeNode(n)) {
      return null;
    }
    const uid = this.uid;
    this.storage.setItem(uid+'.nodes',JSON.stringify(this.nodes.map((d) => d.id)));
    this.storage.removeItem(uid+'.node.'+n.id);
    n.off('setAttr', this.updateHandler);

    return this;
  }

  addEdge(e_or_s: GraphEdge | GraphNode, type?:string, t?:GraphNode) {
    if (e_or_s instanceof GraphEdge) {
      super.addEdge(e_or_s);
      let e = <GraphEdge>e_or_s;
      const uid = this.uid;
      this.storage.setItem(uid+'.edges', JSON.stringify(this.edges.map((d) => d.id)));
      this.storage.setItem(uid+'.edge.'+e.id, JSON.stringify(e.persist()));
      e.on('setAttr', this.updateHandler);
      return this;
    }
    return super.addEdge(<GraphNode>e_or_s, type, t);
  }

  removeEdge(e: GraphEdge) {
    if (!super.removeEdge(e)) {
      return null;
    }
    //need to shift all
    const uid = this.uid;
    this.storage.setItem(uid+'.edges', JSON.stringify(this.edges.map((d) => d.id)));
    this.storage.removeItem(uid + '.edge.'+e.id);
    e.off('setAttr', this.updateHandler);
    return this;
  }

  updateEdge(e: GraphEdge): any {
    super.updateEdge(e);
    const uid = this.uid;
    this.storage.setItem(uid+'.edge.'+e.id, JSON.stringify(e.persist()));
    return this;
  }

  clear() {
    const nnodes = this.nnodes, nedges = this.nedges;
    if (nnodes === 0 && nedges === 0) {
      return this;
    }
    this.nodes.forEach((n) => n.off('setAttr', this.updateHandler));
    this.edges.forEach((n) => n.off('setAttr', this.updateHandler));
    super.clear();
    const uid = this.uid;
    JSON.parse(this.storage.getItem(uid+'.nodes')).forEach((id) => {
      this.storage.removeItem(uid+'.node.'+id);
    });
    this.storage.removeItem(uid+'.nodes');
    JSON.parse(this.storage.getItem(uid+'.edges')).forEach((id) => {
      this.storage.removeItem(uid+'.edge.'+id);
    });
    this.storage.removeItem(uid+'.edges');
  }

  persist() {
    var r:any = {
      root: this.desc.id
    };
    r.nodes = this.nodes.map((s) => s.persist());
    r.edges = this.edges.map((l) => l.persist());
    return r;
  }
}
