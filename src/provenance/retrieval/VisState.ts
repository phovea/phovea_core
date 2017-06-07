/**
 * Created by Holger Stitz on 31.05.2017.
 */

import {GraphNode} from '../../graph/graph';

export class VisState {

  private _terms:string[] = null;

  private _termFreq = new Map<string, number>();

  constructor(public node:GraphNode, private termAccessor:() => string[], private storageId:string = 'termFrequency') {

  }

  get terms():string[] {
    this.init();
    return this._terms;
  }

  init() {
    // object is already cached
    if(this._terms) {
      return;
    }

    // otherwise use try to use sessionStorage and decode json
    const jsonTerms:string = this.node.getAttr(this.storageId, null);
    if(jsonTerms) {
      this._terms = JSON.parse(jsonTerms);
      this._termFreq = this.calcTermFreq(this._terms);
      return;
    }

    this._terms = this.termAccessor();
    this._termFreq = this.calcTermFreq(this._terms);

    this.node.setAttr(this.storageId, JSON.stringify(this._terms));
  }

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

  /**
   *
   * @param term
   * @returns {number}
   */
  tf(attr: string): number {
    return this._termFreq.has(attr) ? this._termFreq.get(attr) / this._terms.length : 0;
  }

  /**
   *
   * @param term
   * @returns {boolean}
   */
  hasTerm(attr): boolean {
    return this._termFreq.has(attr) && this._termFreq.get(attr) > 0;
  }

}
