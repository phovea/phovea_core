/**
 * Created by sam on 12.02.2015.
 */
/**
 * Created by Samuel Gratzl on 22.10.2014.
 */
import C = require('./main');
import idtypes = require('./idtype');
import datatypes = require('./datatype');
import ranges = require('./range');

/**
 * a simple graph none
 */
export class GraphNode {
  outgoing : GraphEdge[] = [];
  incoming : GraphEdge[] = [];

  /**
   * internal id used for persisting
   * @type {number}
   */
  pid = -1;

  constructor(public type: string, public id = C.uniqueId('graph_node'))  {

  }

  persist(pid: number) : any {
    this.pid = pid;
    return {
      id : this.id
    };
  }
}

export class GraphEdge {
  constructor(public type: string, public source: GraphNode, public target: GraphNode) {
    source.outgoing.push(this);
    target.incoming.push(this);
  }

  toString() {
    return this.source + ' '+this.type + ' '+this.target;
  }

  persist() {
    return {
      type: this.type,
      source: this.source.pid,
      target: this.target.pid
    };
  }

  static restore(p, nodes) {
    return new GraphEdge(p.type, nodes[p.source], nodes[p.target]);
  }
}

export function isType(type: string|RegExp) {
  return (edge: GraphEdge) => type instanceof RegExp ? type.test(edge.type) : edge.type === type;
}

export class GraphBase extends datatypes.DataTypeBase {
  _nodes : GraphNode[] = [];
  _edges : GraphEdge[] = [];

  constructor(desc: datatypes.IDataDescription) {
    super(desc);
  }

  addNode(n: GraphNode) {
    this._nodes.push(n);
    this.fire('add_node', n);
  }

  addEdge(s : GraphNode, type: string, t : GraphNode) {
    var l = new GraphEdge(type, s, t);
    this._edges.push(l);
    this.fire('add_edge', l, type, s, t);
  }
}

export interface IGraph extends datatypes.IDataType {
  nodes(): Promise<GraphNode[]>;
  edges(): Promise<GraphEdge[]>;
}

class Graph extends GraphBase {
  constructor(desc: datatypes.IDataDescription) {
    super(desc);
  }

  get dim() {
    return [this._nodes.length, this._edges.length];
  }

  ids(range: ranges.Range = ranges.all()) {
    return Promise.resolve(ranges.range([0,this._nodes.length], [0, this._edges.length]));
  }

  get idtypes() {
    return ['_nodes', '_edges'].map(idtypes.resolve);
  }
}


/**
 * module entry point for creating a datatype
 * @param desc
 * @returns {IMatrix}
 */
export function create(desc: datatypes.IDataDescription): GraphBase {
  return new Graph(desc);
}

