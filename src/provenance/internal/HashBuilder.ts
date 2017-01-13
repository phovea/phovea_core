/**
 * Created by Holger Stitz on 13.01.2017.
 */

import {RandomNumberGenerator} from './RandomNumberGenerator';

interface IHashTableValue {
  hash: string;
  probability: number;
}

export class HashBuilder {

  private static readonly MAX_PROBABILITY = 1;

  private readonly dict = new Map<string, IHashTableValue>();

  constructor(private readonly maxSize:number) {

  }

  push(name:string, value:string, probability:number, hash:string) {
    if (hash === null) {
      hash = String(murmurhash2_32_gc(value, 0));
    }

    this.dict.set(name, {hash: hash, probability: probability});

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
        let hashPart = dictArr[sampleAsIndex].hash;
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
        let accProb = prev[prev.length - 1] + (curr.probability || 0);
        return [...prev, accProb];
      }, [0]) // add initial value
      .slice(1) // remove the initial value
      .reverse()
      .map((cdfProb, index) => array[index].probability / cdfProb);
  }
}


/**
 * JS Implementation of MurmurHash2
 *
 * @author <a href='mailto:gary.court@gmail.com'>Gary Court</a>
 * @see http://github.com/garycourt/murmurhash-js
 * @author <a href='mailto:aappleby@gmail.com'>Austin Appleby</a>
 * @see http://sites.google.com/site/murmurhash/
 *
 * @param {string} str ASCII only
 * @param {number} seed Positive integer only
 * @return {number} 32-bit positive integer hash
 */
function murmurhash2_32_gc(str, seed) {
  /*jshint bitwise:false */
  /*tslint:disable:no-bitwise */
  let l = str.length;
  let h = seed ^ l;
  let i = 0;
  let k;

  while (l >= 4) {
    k =
      ((str.charCodeAt(i) & 0xff)) |
      ((str.charCodeAt(++i) & 0xff) << 8) |
      ((str.charCodeAt(++i) & 0xff) << 16) |
      ((str.charCodeAt(++i) & 0xff) << 24);

    k = (((k & 0xffff) * 0x5bd1e995) + ((((k >>> 16) * 0x5bd1e995) & 0xffff) << 16));
    k ^= k >>> 24;
    k = (((k & 0xffff) * 0x5bd1e995) + ((((k >>> 16) * 0x5bd1e995) & 0xffff) << 16));

    h = (((h & 0xffff) * 0x5bd1e995) + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16)) ^ k;

    l -= 4;
    ++i;
  }

  switch (l) {
    case 3:
      h ^= (str.charCodeAt(i + 2) & 0xff) << 16;
      break;
    case 2:
      h ^= (str.charCodeAt(i + 1) & 0xff) << 8;
      break;
    case 1:
      h ^= (str.charCodeAt(i) & 0xff);
      h = (((h & 0xffff) * 0x5bd1e995) + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16));
      break;
  }

  h ^= h >>> 13;
  h = (((h & 0xffff) * 0x5bd1e995) + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16));
  h ^= h >>> 15;

  return (h >>> 0).toString(2);
  /*tslint:enable:no-bitwise */
  /*jshint bitwise:true */
}
