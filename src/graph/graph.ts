/**
 * Created by sam on 12.02.2015.
 */
/**
 * Created by Samuel Gratzl on 22.10.2014.
 */
import {mixin, IPersistable, flagId, uniqueId} from '../index';
import {SelectAble} from '../idtype';
import {EventHandler} from '../event';

export class AttributeContainer extends EventHandler implements IPersistable {
  // TODO convert to Map
  private _attrs : { [key: string] : any } = {};

  persist():any {
    if (Object.keys(this._attrs).length > 0) {
      return {
        attrs : mixin({}, this._attrs) //copy
      };
    }
    return {

    };
  }

  setAttr(attr:string, value:any) {
    const bak = this._attrs[attr];
    if (bak === value && !Array.isArray(bak)) {
      return;
    }
    this._attrs[attr] = value;
    this.fire('attr-' + attr, value, bak);
    this.fire('setAttr', attr, value, bak);
  }
  hasAttr(attr: string) {
    return attr in this._attrs;
  }
  getAttr(attr: string, default_ : any = null) {
    if (attr in this._attrs) {
      return this._attrs[attr];
    }
    return default_;
  }
  get attrs() {
    return Object.keys(this._attrs);
  }

  restore(persisted:any) {
    if (persisted.attrs) {
      this._attrs = persisted.attrs;
    }
    return this;
  }
}
/**
 * a simple graph none
 */
export class GraphNode extends AttributeContainer {
  outgoing:GraphEdge[] = [];
  incoming:GraphEdge[] = [];

  private _id:number = NaN;

  constructor(public type:string = 'node', id:number = NaN) {
    super();
    this._id = flagId('graph_node', id);
  }

  get id() {
    if (isNaN(this._id)) {
      this._id = uniqueId('graph_node');
    }
    return this._id;
  }

  persist():any {
    const r = super.persist();
    r.type =this.type;
    r.id = this.id;
    return r;
  }

  restore(persisted:any) {
    super.restore(persisted);
    this.type = persisted.type;
    this._id = flagId('graph_node', persisted.id);
    return this;
  }
}

export class GraphEdge extends AttributeContainer {

  private _id:number = NaN;

  constructor(public type:string = 'edge', public source:GraphNode = null, public target:GraphNode = null, id:number = NaN) {
    super();
    this._id = flagId('graph_edge', id);
    if (source && target) {
      this.init();
    }
  }

  get id() {
    if (isNaN(this._id)) {
      this._id = uniqueId('graph_edge');
    }
    return this._id;
  }

  private init() {
    this.source.outgoing.push(this);
    this.target.incoming.push(this);
  }

  takeDown() {
    if (this.source) {
      this.source.outgoing.splice(this.source.outgoing.indexOf(this), 1);
    }
    if (this.target) {
      this.target.incoming.splice(this.target.incoming.indexOf(this), 1);
    }
  }

  toString() {
    return this.source + ' ' + this.type + ' ' + this.target;
  }

  persist() {
    const r = super.persist();
    r.type = this.type;
    r.id = this.id;
    r.source = this.source.id;
    r.target = this.target.id;
    return r;
  }

  restore(p:any, nodes?:(id:number) => GraphNode) {
    super.restore(p);
    this.type = p.type;
    this._id = flagId('graph_edge', p.id);
    this.source = nodes(p.source);
    this.target = nodes(p.target);
    this.init();
    return this;
  }
}

export function isType(type:string|RegExp) {
  return (edge:GraphEdge) => type instanceof RegExp ? type.test(edge.type) : edge.type === type;
}

export abstract class AGraph extends SelectAble {

  get nodes() : GraphNode[] {
    return [];
  }

  get nnodes() {
    return this.nodes.length;
  }

  get edges(): GraphEdge[] {
    return [];
  }

  get nedges() {
    return this.edges.length;
  }
}
