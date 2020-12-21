/**
 * Created by Holger Stitz on 30.06.2017.
 */
export declare class TermFrequency {
    private _terms;
    private _termFreq;
    constructor();
    set terms(value: string[]);
    /**
     * Returns a list of all terms
     * @returns {string[]}
     */
    get terms(): string[];
    /**
     * Returns the term frequency of this state
     * @param attr
     * @returns {number}
     */
    tf(attr: string): number;
    /**
     * Checks whether or not a given attr exists
     * @param attr
     * @returns {boolean}
     */
    hasTerm(attr: any): boolean;
    /**
     * Calculates the term frequency for list of given terms
     * @param terms
     * @returns {Map<string, number>}
     */
    private calcTermFreq;
}
