/**
 * Created by Holger Stitz on 31.05.2017.
 */

import {GraphNode} from '../../graph/graph';
import {createPropertyValue, IPropertyValue, PropertyType} from './VisStateProperty';
import {TermFrequency} from './tf_idf/TermFrequency';
import {InverseDocumentFrequency} from './tf_idf/InverseDocumentFrequency';
import {
  ICategoricalPropertyComparator, INumericalPropertyComparator,
  IPropertyComparator, ISetPropertyComparator
} from './PropertyValueComparator';


export interface IVisState {
  node:GraphNode;
  propValues:IPropertyValue[];

  idf:InverseDocumentFrequency;

  isPersisted():boolean;
  captureAndPersist():void;
  compare(comparatorAccessor:(type:PropertyType) => IPropertyComparator, propValues:IPropertyValue[]):number[];
}

export class VisState implements IVisState {

  private _idf:InverseDocumentFrequency = null;
  private _termFreq:TermFrequency = new TermFrequency();

  private _propValues:IPropertyValue[] = null;

  constructor(public node:GraphNode, private stateAccessor:() => IPropertyValue[], private storageId:string) {

  }

  get idf():InverseDocumentFrequency {
    return this._idf;
  }

  set idf(value:InverseDocumentFrequency) {
    this._idf = value;
    this._idf.addTermFreq(this._termFreq);
  }

  get propValues() {
    this.checkCache();
    return this._propValues;
  }

  /**
   * Compare this VisState with a list of property values and return a similarity score
   * @param comparatorAccessor
   * @param queryPropValues
   * @returns {number}
   */
  compare(comparatorAccessor:(type:PropertyType) => IPropertyComparator, queryPropValues:IPropertyValue[]):number[] {
    this.checkCache();

    const stateSetProps = this.getPropIds(PropertyType.SET, this._propValues);
    const querySetProps = this.getPropIds(PropertyType.SET, queryPropValues);

    const similarities:number[] = queryPropValues.map((queryPropVal) => {
      const statePropVal = this._propValues.filter((d) => d.id === queryPropVal.id);

      if(statePropVal.length > 0) {
        switch (queryPropVal.type) {
          case PropertyType.CATEGORICAL:
            return (<ICategoricalPropertyComparator>comparatorAccessor(queryPropVal.type))
              .compare(String(queryPropVal.id), this._termFreq);

          case PropertyType.NUMERICAL:
            return (<INumericalPropertyComparator>comparatorAccessor(queryPropVal.type))
              .compare(queryPropVal, statePropVal[0]);

          case PropertyType.SET:
            return (<ISetPropertyComparator>comparatorAccessor(queryPropVal.type))
              .compare(stateSetProps, querySetProps);
        }
      }

      return 0;
    });

    return similarities;
  }

  /**
   * Check if the visState is already persisted in the provenance graph
   * @returns {boolean}
   */
  isPersisted():boolean {
    return this.node.hasAttr(this.storageId);
  }

  /**
   * Capture and persist the visState in the provenance graph
   * Note: A previously set visState will be overridden without further checks.
   */
  captureAndPersist() {
    this.captureVisState();
    this.persist();
  }

  /**
   * Checks if the terms of the visState are cached already.
   * Otherwise tries to load the persisted state or if this is not available,
   * then capture and persist the current state
   */
  private checkCache() {
    // object is already cached
    if(this._propValues) {
      return;
    }

    if(this.isPersisted()) {
      this.loadPersisted();

    } else {
      this.captureAndPersist();
    }
  }

  /**
   * Load the persisted visState
   */
  private loadPersisted() {
    // otherwise use try to use sessionStorage and decode json
    const jsonTerms:string = this.node.getAttr(this.storageId, null);
    const propValues = JSON.parse(jsonTerms);

    this._propValues = propValues.map((d) => {
      return createPropertyValue(d.type, d);
    });

    this.processPropValues(this._propValues);
  }

  /**
   * Captures the current visState using the `termAccessor`
   */
  private captureVisState() {
    this._propValues = this.stateAccessor();
    this.processPropValues(this._propValues);
  }

  /**
   * Persists the current visState
   * Note: A previously set visState will be overridden without further checks.
   */
  private persist() {
    this.node.setAttr(this.storageId, JSON.stringify(this._propValues));
  }

  private processPropValues(propValues:IPropertyValue[]) {
    // handle categorical values with TF
    this._termFreq.terms = this.getPropIds(PropertyType.CATEGORICAL, propValues);
  }

  private getPropIds(type:PropertyType, propValues:IPropertyValue[]) {
    return propValues
      .filter((d) => d.type === type)
      .map((d) => String(d.id));
  }

}
