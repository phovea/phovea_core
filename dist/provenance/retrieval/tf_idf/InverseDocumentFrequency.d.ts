/**
 * Created by Holger Stitz on 30.06.2017.
 */
import { TermFrequency } from './TermFrequency';
export declare class InverseDocumentFrequency {
    private termFreqs;
    private idfCache;
    constructor();
    /**
     *
     * @param termFreq
     * @param restoreCache If restoreCache is set to true, all terms idf scores currently cached will be recomputed. Otherwise, the cache will just be wiped clean
     * @return Returns `true` if added successfully. Otherwise returns `false`.
     */
    addTermFreq(termFreq: TermFrequency, restoreCache?: boolean): boolean;
    /**
     *
     * @param term
     * @param force
     * @returns {any}
     */
    private idf;
    /**
     *
     * @param terms
     * @param termFreq
     * @return number
     */
    tfidf(terms: string[], termFreq: TermFrequency): number;
}
