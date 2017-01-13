/**
 * Created by Holger Stitz on 13.01.2017.
 */

import {RandomNumberGenerator} from './RandomNumberGenerator';

export class HashTable {

  constructor(maxSize:number) {
    this.maxSize = maxSize;
  }

  dict:string[] = [];
  hashes:string[] = [];
  probs:number[] = [];
  maxSize:number;


  push(name:string, value:string, prob:number, hash:string) {
    if (hash == null) {
      hash = String(murmurhash2_32_gc(value, 0));
    }
    let index = this.dict.indexOf(name);
    if (index < 0) {
      index = this.dict.length;
    }
    this.dict[index] = name;
    this.probs[name] = prob;
    this.hashes[name] = hash;
  }

  toHash(n:number):string {
    if (Object.keys(this.probs).length === 0) {
      let st:string = '';
      for (let i:number = 0; i < n; i++) {
        st = st + '0';
      }
      return st;
    }

    let cdf:number[] = [];
    let lastElement = this.probs[this.dict[this.dict.length - 1]];
    if (lastElement == null) {
      lastElement = 0;
    }
    cdf[0] = lastElement;

    for (let i:number = 1; i < this.dict.length; i++) {
      let val:number = this.probs[this.dict[this.dict.length - i - 1]];
      val = val === undefined ? 0 : val;
      cdf[i] = cdf[i - 1] + val;
    }
    cdf = cdf.reverse();
    for (let i:number = 0; i < this.dict.length; i++) {
      cdf[i] = this.probs[this.dict[i]] / cdf[i];
    }

    const rng:RandomNumberGenerator = new RandomNumberGenerator(1);
    const samples:number[] = [];
    for (let i:number = 0; i < n; i++) {
      let found:boolean = false;
      for (let j:number = 0; j < this.maxSize; j++) {
        if (!found && rng.nextDouble() < cdf[j]) {
          samples[i] = j;
          found = true;
        }
      }
    }

    let hash:string = '';
    for (let i:number = 0; i < n; i++) {
      let hashPart = this.hashes[this.dict[samples[i]]];
      let bitToUse = hashPart.charAt(i % hashPart.length); // use the 'bitToUse' bit of 'hashPart'
      hash = hash + bitToUse;
    }
    this.hashes = [];
    this.probs = [];
    return hash;
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
