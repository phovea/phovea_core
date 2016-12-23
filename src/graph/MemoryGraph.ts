/**
 * Created by sam on 12.02.2015.
 */
/**
 * Created by Samuel Gratzl on 22.10.2014.
 */
import {IPersistable} from '../index';
import {IDataDescription} from '../datatype';
import GraphBase, {defaultGraphFactory} from './GraphBase';
import {GraphEdge, GraphNode} from './graph';

export default class MemoryGraph extends GraphBase implements IPersistable {
  constructor(desc:IDataDescription, _nodes:GraphNode[] = [], _edges:GraphEdge[] = [], private factory = defaultGraphFactory) {
    super(desc, _nodes, _edges);
  }
  restore(persisted:any) {
     var lookup = {},
       lookupFun = (id) => lookup[id];
    persisted.nodes.forEach((p) => {
      var n = this.factory.makeNode(p);
      lookup[n.id] = n;
      this.addNode(n);
    });

    persisted.edges.forEach((p) => {
      var n = this.factory.makeEdge(p, lookupFun);
      this.addEdge(n);
    });
    return this;
  }
}
