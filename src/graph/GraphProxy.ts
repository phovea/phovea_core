/**
 * Created by sam on 12.02.2015.
 */
import {resolve as idtypes_resolve} from '../idtype';
import {ADataType, IDataDescription} from '../datatype';
import {all, none, Range} from '../range';
import {AGraph} from './graph';
import {defaultGraphFactory, IGraphFactory, default as GraphBase, IGraphDataDescription} from './GraphBase';
import RemoteStoreGraph from './RemoteStorageGraph';
import MemoryGraph from './MemoryGraph';
import LocalStorageGraph from './LocalStorageGraph';

export default class GraphProxy extends ADataType<IGraphDataDescription> {
  private _impl:Promise<AGraph> = null;
  private _loaded:AGraph = null;

  constructor(desc:IGraphDataDescription) {
    super(desc);
  }

  get nnodes(): number {
    if (this._loaded) {
      return this._loaded.nnodes;
    }
    const size = this.desc.size;
    return size[0] || 0;
  }

  get nedges(): number {
    if (this._loaded) {
      return this._loaded.nedges;
    }
    const size = this.desc.size;
    return size[1] || 0;
  }

  get dim() {
    return [this.nnodes, this.nedges];
  }

  impl(factory: IGraphFactory = defaultGraphFactory): Promise<AGraph> {
    if (this._impl) {
      return this._impl;
    }
    const type = this.desc.storage || 'remote';
    if (type === 'memory') {
      //memory only
      this._loaded = new MemoryGraph(this.desc, [],[], factory);
      this._impl = Promise.resolve(this._loaded);
    } else if (type === 'local') {
      this._loaded = LocalStorageGraph.load(this.desc, factory, localStorage);
      this._impl = Promise.resolve(this._loaded);
    } else if (type === 'session') {
      this._loaded = LocalStorageGraph.load(this.desc, factory, sessionStorage);
      this._impl = Promise.resolve(this._loaded);
    } else if (type === 'given' && this.desc.graph instanceof AGraph) {
      this._loaded = this.desc.graph;
      this._impl = Promise.resolve(this._loaded);
    } else {
      this._impl = RemoteStoreGraph.load(this.desc, factory).then((graph: AGraph) => this._loaded = graph);
    }
    return this._impl;
  }

  ids(range:Range = all()) {
    if (this._impl) {
      return this._impl.then((i) => i.ids(range));
    }
    return Promise.resolve(none());
  }

  get idtypes() {
    return ['_nodes', '_edges'].map(idtypes_resolve);
  }
}

/**
 * module entry point for creating a datatype
 * @param desc
 * @returns {IMatrix}
 */
export function create(desc:IGraphDataDescription):GraphProxy {
  return new GraphProxy(desc);
}
