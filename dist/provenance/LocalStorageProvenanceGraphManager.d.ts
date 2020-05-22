import { ProvenanceGraph } from './ProvenanceGraph';
import { IProvenanceGraphManager } from './provenance';
import { IProvenanceGraphDataDescription } from './ICmd';
import { GraphBase } from '../graph/GraphBase';
import { LocalStorageGraph } from '../graph/LocalStorageGraph';
export declare class LocalStorageProvenanceGraphManager implements IProvenanceGraphManager {
    private options;
    constructor(options?: {});
    private loadFromLocalStorage;
    listSync(): IProvenanceGraphDataDescription[];
    list(): PromiseLike<IProvenanceGraphDataDescription[]>;
    getGraph(desc: IProvenanceGraphDataDescription): PromiseLike<LocalStorageGraph>;
    get(desc: IProvenanceGraphDataDescription): Promise<ProvenanceGraph>;
    clone(graph: GraphBase, desc?: any): Promise<ProvenanceGraph>;
    import(json: any, desc?: any): Promise<ProvenanceGraph>;
    delete(desc: IProvenanceGraphDataDescription): PromiseLike<boolean>;
    edit(graph: ProvenanceGraph | IProvenanceGraphDataDescription, desc?: any): PromiseLike<IProvenanceGraphDataDescription>;
    private createDesc;
    create(desc?: any): Promise<ProvenanceGraph>;
    private createInMemoryDesc;
    createInMemory(): ProvenanceGraph;
    cloneInMemory(graph: GraphBase): ProvenanceGraph;
}
