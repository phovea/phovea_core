/**
 * Created by Holger Stitz on 31.05.2017.
 */

import {GraphNode} from '../../graph/graph';
import {createPropertyValue, IPropertyValue, PropertyType} from './VisStateProperty';
import {TermFrequency} from './tf_idf/TermFrequency';
import {InverseDocumentFrequency} from './tf_idf/InverseDocumentFrequency';
import {Jaccard} from './jaccard/Jaccard';


export interface IVisState {
  node:GraphNode;
  propValues:IPropertyValue[];

  idf:InverseDocumentFrequency;

  isPersisted():boolean;
  captureAndPersist():void;
  compare(propValues:IPropertyValue[]):number;
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
    return this._propValues;
  }

  /**
   * Compare this VisState with a list of property values and return a similarity score
   * @param propValues
   * @returns {number}
   */
  compare(propValues:IPropertyValue[]):number {
    this.checkCache();

    const catSimiliarities = this.getPropIds(PropertyType.CATEGORICAL, propValues)
      .map((d) => this.idf.tfidf([d], this._termFreq));
    const catSimilarity = catSimiliarities.reduce((a,b) => a + b, 0.0);

    const stateSetProps = this.getPropIds(PropertyType.SET, this._propValues);
    const querySetProps = this.getPropIds(PropertyType.SET, propValues);

    let jaccardIndex = Jaccard.index(stateSetProps, querySetProps);
    if(isNaN(jaccardIndex)) {
      jaccardIndex = 0;
    }

    //console.log(propValues, catSimiliarities, Jaccard.intersection(stateSetProps, querySetProps), jaccardIndex);

    return catSimilarity + jaccardIndex;
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

