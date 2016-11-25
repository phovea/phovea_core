/**
 * Created by sam on 12.02.2015.
 */
/**
 * Created by Samuel Gratzl on 22.10.2014.
 */
import {mixin, IPersistable, flagId, uniqueId} from '../index';
import {sendAPI} from '../ajax';
import {SelectAble, SelectOperation, resolve as idtypes_resolve} from '../idtype';
import {DataTypeBase, IDataDescription} from '../datatype';
import {all, none, Range, list} from '../range';
import {EventHandler, IEvent} from '../event';

export class MemoryGraph extends GraphBase implements IPersistable {
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
