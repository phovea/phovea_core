/**
 * Created by sam on 12.02.2015.
 */
/**
 * Created by Samuel Gratzl on 22.10.2014.
 */
import {IDataDescription} from '../datatype';
import {GraphNode, GraphEdge, AGraph, IGraph} from './graph';

export interface IGraphFactory {
  makeNode(p: any): GraphNode;
  makeEdge(p: any, lookup: (id: number) => GraphNode): GraphEdge;
}

export const defaultGraphFactory: IGraphFactory = {
  makeNode: (p: any) => ((new GraphNode()).restore(p)),
  makeEdge: (p: any, lookup) => ((new GraphEdge()).restore(p, lookup))
};

export interface IGraphDataDescription extends IDataDescription {
  /**
   * size: [number of nodes, number of edges]
   */
  size: [number, number];

  /**
   * where to store: memory, remote, local, session, given (requires instance)
   */
  storage?: string;

  graph?: AGraph;
}

export default class GraphBase extends AGraph implements IGraph {
  constructor(public readonly desc: IGraphDataDescription, public readonly nodes: GraphNode[] = [], public readonly edges: GraphEdge[] = []) {
    super();
  }

  addNode(n: GraphNode): this|Promise<this> {
    this.nodes.push(n);
    this.fire('add_node', n);
    return this;
  }

  updateNode(n: GraphNode): this|Promise<this> {
    //since we store a reference we don't need to do anything
    this.fire('update_node', n);
    return this;
  }

  removeNode(n: GraphNode): this|Promise<this> {
    const i = this.nodes.indexOf(n);
    if (i < 0) {
      return null;
    }
    this.nodes.splice(i, 1);
    this.fire('remove_node', n);
    return this;
  }

  addEdge(e_or_s: GraphEdge | GraphNode, type?: string, t?: GraphNode): this|Promise<this> {
    if (e_or_s instanceof GraphEdge) {
      let e = <GraphEdge>e_or_s;
      this.edges.push(e);
      this.fire('add_edge', e, e.type, e.source, e.target);
      return;
    }
    return this.addEdge(new GraphEdge(type, <GraphNode>e_or_s, t));
  }

  updateEdge(e: GraphEdge): this|Promise<this> {
    //since we store a reference we don't need to do anything
    this.fire('update_edge', e);
    return this;
  }

  removeEdge(e: GraphEdge): this|Promise<this> {
    const i = this.edges.indexOf(e);
    if (i < 0) {
      return null;
    }
    e.takeDown();
    this.edges.splice(i, 1);
    this.fire('remove_edge', e);
    return this;
  }

  clear(): this|Promise<this> {
    this.nodes.splice(0, this.nodes.length);
    this.edges.splice(0, this.edges.length);
    return this;
  }

  persist() {
    let r: any = {
      root: this.desc.id
    };
    r.nodes = this.nodes.map((s) => s.persist());
    r.edges = this.edges.map((l) => l.persist());
    return r;
  }

  restore(dump: any) {
    return this;
  }
}
