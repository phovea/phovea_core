/**
 * Created by Holger Stitz on 30.06.2017.
 */

export class TermFrequency {

  private _terms:string[] = null;

  private _termFreq = new Map<string, number>();

  constructor() {
    //
  }

  set terms(value:string[]) {
    this._terms = value;
    this._termFreq = this.calcTermFreq(this._terms);
  }

  /**
   * Returns a list of all terms
   * @returns {string[]}
   */
  get terms():string[] {
    return this._terms;
  }

  /**
   * Returns the term frequency of this state
   * @param attr
   * @returns {number}
   */
  tf(attr: string): number {
    return this._termFreq.has(attr) ? this._termFreq.get(attr) / this._terms.length : 0;
  }

  /**
   * Checks whether or not a given attr exists
   * @param attr
   * @returns {boolean}
   */
  hasTerm(attr): boolean {
    return this._termFreq.has(attr) && this._termFreq.get(attr) > 0;
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
