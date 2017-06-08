/**
 * Created by Holger Stitz on 31.05.2017.
 */

import {GraphNode} from '../../graph/graph';

export class VisState {

  private _terms:string[] = null;

  private _termFreq = new Map<string, number>();

  constructor(public node:GraphNode, private termAccessor:() => string[], private storageId:string) {

  }

  /**
   * Returns a list of all terms
   * @returns {string[]}
   */
  get terms():string[] {
    this.checkCache();
    return this._terms;
  }

  /**
   * Returns the term frequency of this state
   * @param attr
   * @returns {number}
   */
  tf(attr: string): number {
    this.checkCache();
    return this._termFreq.has(attr) ? this._termFreq.get(attr) / this._terms.length : 0;
  }

  /**
   * Checks whether or not a given attr exists
   * @param attr
   * @returns {boolean}
   */
  hasTerm(attr): boolean {
    this.checkCache();
    return this._termFreq.has(attr) && this._termFreq.get(attr) > 0;
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
    if(this._terms) {
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
    this._terms = JSON.parse(jsonTerms);
    this._termFreq = this.calcTermFreq(this._terms);
  }

  /**
   * Captures the current visState using the `termAccessor`
   */
  private captureVisState() {
    this._terms = this.termAccessor();
    this._termFreq = this.calcTermFreq(this._terms);
  }

  /**
   * Persists the current visState
   * Note: A previously set visState will be overridden without further checks.
   */
  private persist() {
    this.node.setAttr(this.storageId, JSON.stringify(this._terms));
  }

  /**
   * Calculates the term frequency for list of given terms
   * @param terms
   * @returns {Map<string, number>}
   */
  private calcTermFreq(terms:string[]):Map<string, number> {
    const tf = new Map<string, number>();
    terms.forEach((attr) => {
      let val = 1;
      if (tf.has(attr)) {
        val += tf.get(attr);
      }
      tf.set(attr, val);
    });
    return tf;
  }

}
