/**
 * Created by Holger Stitz on 30.06.2017.
 */
import {TermFrequency} from './TermFrequency';

export class InverseDocumentFrequency {

  private termFreqs: TermFrequency[] = [];

  private idfCache = new Map<string, number>();

  constructor() {
    //
  }

  /**
   *
   * @param termFreq
   * @param restoreCache If restoreCache is set to true, all terms idf scores currently cached will be recomputed. Otherwise, the cache will just be wiped clean
   * @return Returns `true` if added successfully. Otherwise returns `false`.
   */
  addTermFreq(termFreq: TermFrequency, restoreCache: boolean = false) {
    if(this.termFreqs.indexOf(termFreq) > -1) {
      return false;
    }

    this.termFreqs.push(termFreq);

    // make sure the cache is invalidated when new documents arrive
    if (restoreCache === true) {
      Array.from(this.idfCache.keys())
      // invoking idf with the force option set will
      // force a recomputation of the idf, and it will
      // automatically refresh the cache value.
        .forEach((term) => this.idf(term, true));

    } else {
      this.idfCache.clear();
    }
    return true;
  }

  /**
   *
   * @param term
   * @param force
   * @returns {any}
   */
  private idf(term, force: boolean = false) {
    // Lookup the term in the New term-IDF caching,
    // this will cut search times down exponentially on large document sets.
    if (this.idfCache.has(term) && force !== true) {
      return this.idfCache.get(term);
    }

    const docsWithTerm = this.termFreqs.reduce((count, termFreq) => count + (termFreq.hasTerm(term) ? 1 : 0), 0);

    const idf: number = 1 + Math.log((this.termFreqs.length) / ( 1 + docsWithTerm ));

    // Add the idf to the term cache and return it
    this.idfCache.set(term, idf);
    return idf;
  }

  /**
   *
   * @param terms
   * @param termFreq
   * @return number
   */
  tfidf(terms: string[], termFreq: TermFrequency):number {
    return terms.reduce((value, term) => {
      let idf = this.idf(term);
      idf = (idf === Infinity) ? 0 : idf;
      return value + (termFreq.tf(term) * idf);
    }, 0.0);
  }

}
