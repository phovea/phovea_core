/**
 * Created by Holger Stitz on 30.06.2017.
 */


export class Jaccard {

  constructor() {
    //
  }

  /**
   * Similarity
   * @param a
   * @param b
   * @returns {number}
   */
  static index(a, b):number {
    return this.intersection(a, b).length / this.union(a, b).length;
  }

  /**
   * Dissimilarity
   * @param a
   * @param b
   * @returns {number}
   */
  static distance(a, b):number {
    return 1 - this.index(a, b);
  }

  /**
   * Return mutual elements in the input sets
   * @param a
   * @param b
   * @returns {Array}
   */
  static intersection(a, b):any[] {
    return a.filter((n) => {
      return b.indexOf(n) !== -1;
    });
  }

  /**
   * Return distinct elements from both input sets
   * @param a
   * @param b
   * @returns {Array}
   */
  static union(a, b):any[] {
    return Array.from(new Set([...a, ...b]));
  }

}
