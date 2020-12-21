/**
 * Created by Holger Stitz on 30.06.2017.
 */
export declare class Jaccard {
    constructor();
    /**
     * Similarity
     * @param a
     * @param b
     * @returns {number}
     */
    static index(a: any, b: any): number;
    /**
     * Dissimilarity
     * @param a
     * @param b
     * @returns {number}
     */
    static distance(a: any, b: any): number;
    /**
     * Return mutual elements in the input sets
     * @param a
     * @param b
     * @returns {Array}
     */
    static intersection(a: any, b: any): any[];
    /**
     * Return distinct elements from both input sets
     * @param a
     * @param b
     * @returns {Array}
     */
    static union(a: any, b: any): any[];
}
