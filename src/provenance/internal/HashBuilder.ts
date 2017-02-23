/**
 * Created by Holger Stitz on 13.01.2017.
 */

import {RandomNumberGenerator} from './RandomNumberGenerator';
import {murmurhash2} from './MurmurHash2';

interface IHashTableValue {
  name: string;
  value: string;
  hash: string;
  probability: number;
}

export class HashBuilder {

  private static readonly MAX_PROBABILITY = 1;

  private readonly dict = new Set<IHashTableValue>();

  constructor(private readonly maxSize:number) {

  }

  push(name:string, value:string, probability:number, hash:string) {
    if (hash === null) {
      hash = String(murmurhash2(value, 0));
    }

    this.dict.add({name, value, hash, probability});

    return this;
  }

  toHash(hashLength:number):string {
    if (this.dict.size === 0) {
      return '0'.repeat(hashLength);
    }

    const dictArr:IHashTableValue[] = Array.from(this.dict.values());
    const cdf = this.getCumulativeDistribution(dictArr);
    const maxSize = Math.min(this.maxSize, cdf.length);

    const rng = new RandomNumberGenerator(HashBuilder.MAX_PROBABILITY);
    const hashArr = Array(hashLength).fill(0)
      .map(() => {
        for (let j = 0; j < maxSize; j++) {
          if (rng.nextDouble() <= cdf[j]) {
            return j;
          }
        }
        return maxSize;
      })  // results in sample array (e.g., [0, 1, 1, 2, 0, 0, 1, 0, ...])
      .map((sampleAsIndex, i) => {
        const hashPart = dictArr[sampleAsIndex].hash;
        // pick only one bit from the hash sample
        return hashPart.charAt(i % hashPart.length);
      });

    this.dict.clear();

    return hashArr.join('');
  }

  /**
   * Creates an array with accumulated probabilities (e.g, [0.333, 0.666, 1])
   * @param array
   * @returns {number[]}
   */
  private getCumulativeDistribution(array:IHashTableValue[]) {
    return array
      .reduce((prev, curr) => {
        // sum previous and current probability
        const accProb = prev[prev.length - 1] + (curr.probability || 0);
        return [...prev, accProb];
      }, [0]) // add initial value
      .slice(1) // remove the initial value
      .reverse()
      .map((cdfProb, index) => array[index].probability / cdfProb);
  }
}
