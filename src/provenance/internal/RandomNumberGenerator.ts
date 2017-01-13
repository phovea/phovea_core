/**
 * Created by Holger Stitz on 13.01.2017.
 */

/**
 * Generating pseudo random numbers based on a given seed
 *
 * @author Olaf J. Horstmann
 * @see http://indiegamr.com/generate-repeatable-random-numbers-in-js/
 */
export class RandomNumberGenerator {

  constructor(private seed:number) {

  }

  /**
   * Returns the next discrete random number between min and max according the given seed
   * @param min
   * @param max
   * @returns {number}
   */
  private next(min:number, max:number):number {
    max = max || 0;
    min = min || 0;

    // You may ask: Why "(seed * 9301 + 49297) % 233280" ?!
    // The answer is both simple & complicated:
    // The combination of 9301, 49297 and 233280 provide a very even distributed set of "random" numbers.
    // Please don’t ask WHY – that’s the complicated part,
    // some very smart people figured out those numbers quite some time ago,
    // and I also cannot tell you how they did it.
    // But as always: Google is your friend ;-)

    this.seed = (this.seed * 9301 + 49297) % 233280;
    const rnd = this.seed / 233280;

    return min + rnd * (max - min);
  }

  public nextDouble():number {
    return this.next(0, 1);
  }

  /*private nextInt(min:number, max:number):number {
    return Math.round(this.next(min, max));
  }

  private pick(collection:any[]):any {
    return collection[this.nextInt(0, collection.length - 1)];
  }*/
}
