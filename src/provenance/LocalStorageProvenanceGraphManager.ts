/**
 * Created by sam on 12.02.2015.
 */
import {BaseUtils} from '../base/BaseUtils';
import {ProvenanceGraph} from './ProvenanceGraph';
import {IProvenanceGraphManager} from './provenance';
import {IProvenanceGraphDataDescription} from './ICmd';
import {ProvenanceGraphUtils} from './ProvenanceGraphUtils';
import {GraphBase} from '../graph/GraphBase';
import {LocalStorageGraph} from '../graph/LocalStorageGraph';
import {UserSession} from '../app/UserSession';
import {Permission} from '../security/Permission';
import {MemoryGraph} from '../graph/MemoryGraph';
import {ResolveNow} from '../base/promise';
import {ICommonProvenanceGraphManagerOptions} from '.';

export interface ILocalStorageProvenanceGraphManagerOptions extends ICommonProvenanceGraphManagerOptions {
  /**
   * Used storage engine of the browser (`localStorage` or `sessionStorage`)
   * @default localStorage
   */
  storage?: Storage;

  /**
   * Graph prefix that is for instance used in the URL hash
   * @default clue
   */
  prefix?: string;

  /**
   * Default permissions for new graphs.
   * @default ALL_NONE_NONE
   */
  defaultPermission?: number;
}

export class LocalStorageProvenanceGraphManager implements IProvenanceGraphManager {
  private options: ILocalStorageProvenanceGraphManagerOptions = {
    storage: localStorage,
    prefix: 'clue',
    application: 'unknown',
    defaultPermission: Permission.ALL_NONE_NONE
  };

  constructor(options: ILocalStorageProvenanceGraphManagerOptions = {}) {
    BaseUtils.mixin(this.options, options);
  }

  private loadFromLocalStorage<T>(suffix: string, defaultValue: T): T {
    try {
      const item = this.options.storage.getItem(this.options.prefix + suffix);
      if(item === undefined || item === null) {
        return defaultValue;
      }
      return JSON.parse(item);
    } catch(e) {
      console.error(e);
      return defaultValue;
    }
  }

  listSync(): IProvenanceGraphDataDescription[] {
    const lists: string[] = this.loadFromLocalStorage('_provenance_graphs', []);
    return lists
      .map((id) => <any>this.loadFromLocalStorage('_provenance_graph.' + id, {}))
      // filter to right application
      .filter((d: IProvenanceGraphDataDescription) => d.attrs && d.attrs.of === this.options.application);
  }

  list() {
    return ResolveNow.resolveImmediately(this.listSync());
  }


  getGraph(desc: IProvenanceGraphDataDescription): PromiseLike<LocalStorageGraph> {
    return ResolveNow.resolveImmediately(LocalStorageGraph.load(desc, ProvenanceGraphUtils.provenanceGraphFactory(), this.options.storage));
  }

  async get(desc: IProvenanceGraphDataDescription): Promise<ProvenanceGraph> {
    return new ProvenanceGraph(desc, await this.getGraph(desc));
  }

  async clone(graph: GraphBase, desc: any = {}): Promise<ProvenanceGraph> {
    const name = graph.desc.name;
    const prefix = 'Clone of ';
    const newName = name.includes(prefix) ? name : prefix + name;
    const description = `Cloned from ${name} created by ${graph.desc.creator}\n${(graph.desc.description || '')}`;
    const pdesc = this.createDesc(BaseUtils.mixin({name: newName, description}, desc));
    const newGraph = await this.getGraph(pdesc);
    newGraph.restoreDump(graph.persist(), ProvenanceGraphUtils.provenanceGraphFactory());
    return new ProvenanceGraph(pdesc, newGraph);
  }

  async import(json: any, desc: any = {}): Promise<ProvenanceGraph> {
    const pdesc = this.createDesc(desc);
    const newGraph = await this.getGraph(pdesc);
    newGraph.restoreDump(json, ProvenanceGraphUtils.provenanceGraphFactory());
    return new ProvenanceGraph(pdesc, newGraph);
  }

  delete(desc: IProvenanceGraphDataDescription) {
    const lists = JSON.parse(this.options.storage.getItem(this.options.prefix + '_provenance_graphs') || '[]');
    lists.splice(lists.indexOf(desc.id), 1);
    LocalStorageGraph.delete(desc, this.options.storage);
    //just remove from the list
    this.options.storage.removeItem(this.options.prefix + '_provenance_graph.' + desc.id);
    this.options.storage.setItem(this.options.prefix + '_provenance_graphs', JSON.stringify(lists));
    return ResolveNow.resolveImmediately(true);
  }

  edit(graph: ProvenanceGraph|IProvenanceGraphDataDescription, desc: any = {}) {
    const base = graph instanceof ProvenanceGraph ? graph.desc : graph;
    BaseUtils.mixin(base, desc);
    this.options.storage.setItem(this.options.prefix + '_provenance_graph.' + base.id, JSON.stringify(base));
    return ResolveNow.resolveImmediately(base);
  }

  private createDesc(overrides: any = {}) {
    const lists: string[] = JSON.parse(this.options.storage.getItem(this.options.prefix + '_provenance_graphs') || '[]');
    const uid = (lists.length > 0 ? String(1 + Math.max(...lists.map((d) => parseInt(d.slice(this.options.prefix.length), 10)))) : '0');
    const id = this.options.prefix + uid;
    const desc: IProvenanceGraphDataDescription = BaseUtils.mixin({
      type: 'provenance_graph',
      name: 'Temporary Session ' + uid,
      fqname: this.options.prefix + 'Temporary Session ' + uid,
      id,
      local: true,
      size: <[number, number]>[0, 0],
      attrs: {
        graphtype: 'provenance_graph',
        of: this.options.application
      },
      creator: UserSession.getInstance().currentUserNameOrAnonymous(),
      permissions: this.options.defaultPermission,
      ts: Date.now(),
      description: ''
    }, overrides);
    lists.push(id);
    this.options.storage.setItem(this.options.prefix + '_provenance_graphs', JSON.stringify(lists));
    this.options.storage.setItem(this.options.prefix + '_provenance_graph.' + id, JSON.stringify(desc));
    return desc;
  }

  create(desc: any = {}) {
    const pdesc = this.createDesc(desc);
    return this.get(pdesc);
  }

  private createInMemoryDesc(base?: IProvenanceGraphDataDescription): IProvenanceGraphDataDescription {
    return BaseUtils.mixin({
      type: 'provenance_graph',
      name: 'In Memory Session',
      fqname: 'In Memory Session',
      id: 'memory',
      local: true,
      size: <[number, number]>[0, 0],
      attrs: {
        graphtype: 'provenance_graph',
        of: this.options.application
      },
      creator: UserSession.getInstance().currentUserNameOrAnonymous(),
      permissions: this.options.defaultPermission,
      ts: Date.now(),
      description: ''
    }, base? base : {}, {
      id: 'memory',
      local: true
    });
  }

  createInMemory() {
    const desc = this.createInMemoryDesc();
    return new ProvenanceGraph(desc, new MemoryGraph(desc, [], [], ProvenanceGraphUtils.provenanceGraphFactory()));
  }

  cloneInMemory(graph: GraphBase) {
    const desc = this.createInMemoryDesc(<IProvenanceGraphDataDescription>graph.desc);
    const m = new MemoryGraph(desc, [], [], ProvenanceGraphUtils.provenanceGraphFactory());
    m.restore(graph.persist());
    return new ProvenanceGraph(desc, m);
  }
}
