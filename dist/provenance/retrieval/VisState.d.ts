/**
 * Created by Holger Stitz on 31.05.2017.
 */
import { GraphNode } from '../../graph/graph';
import { IPropertyValue, PropertyType } from './VisStateProperty';
import { InverseDocumentFrequency } from './tf_idf/InverseDocumentFrequency';
import { IPropertyComparator } from './PropertyValueComparator';
export interface IVisState {
    node: GraphNode;
    propValues: IPropertyValue[];
    idf: InverseDocumentFrequency;
    isPersisted(): boolean;
    captureAndPersist(): Promise<IVisState>;
    cloneAndPersist(visState: IVisState): boolean;
    compare(comparatorAccessor: (type: PropertyType) => IPropertyComparator, propValues: IPropertyValue[]): number[];
}
export declare class VisState implements IVisState {
    node: GraphNode;
    private stateAccessor;
    private storageId;
    private _idf;
    private _termFreq;
    private _propValues;
    constructor(node: GraphNode, stateAccessor: () => Promise<IPropertyValue[]>, storageId: string);
    get idf(): InverseDocumentFrequency;
    set idf(value: InverseDocumentFrequency);
    get propValues(): IPropertyValue[];
    /**
     * Compare this VisState with a list of property values and return a similarity score
     * @param comparatorAccessor
     * @param queryPropValues
     * @returns {number}
     */
    compare(comparatorAccessor: (type: PropertyType) => IPropertyComparator, queryPropValues: IPropertyValue[]): number[];
    /**
     * Clone all property values from a given visState and persist the current visState with the newly cloned values
     * @param {IVisState} visState
     * @returns {boolean}
     */
    cloneAndPersist(visState: IVisState): boolean;
    /**
     * Check if the visState is already persisted in the provenance graph
     * @returns {boolean}
     */
    isPersisted(): boolean;
    /**
     * Capture and persist the visState in the provenance graph
     * Note: A previously set visState will be overridden without further checks.
     */
    captureAndPersist(): Promise<IVisState>;
    /**
     * Checks if the terms of the visState are cached already.
     * Otherwise tries to load the persisted state or if this is not available,
     * then capture and persist the current state
     */
    private checkCache;
    /**
     * Load the persisted visState
     */
    private loadPersisted;
    /**
     * Captures the current visState using the `termAccessor`
     */
    private captureVisState;
    /**
     * Persists the current visState
     * Note: A previously set visState will be overridden without further checks.
     */
    private persist;
    private processPropValues;
    private getPropIds;
    private getGroupedPropIds;
}
