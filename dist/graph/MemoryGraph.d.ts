/**
 * Created by sam on 12.02.2015.
 */
/**
 * Created by Samuel Gratzl on 22.10.2014.
 */
import { IPersistable } from '../base/IPersistable';
import { GraphBase } from './GraphBase';
import { GraphEdge, GraphNode, IGraphDataDescription } from './graph';
export declare class MemoryGraph extends GraphBase implements IPersistable {
    private factory;
    constructor(desc: IGraphDataDescription, nodes?: GraphNode[], edges?: GraphEdge[], factory?: import("./GraphBase").IGraphFactory);
    restore(persisted: any): this;
}
