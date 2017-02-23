/**
 * Created by Holger Stitz on 23.02.2017.
 */

import {murmurhash2} from '../src/provenance/internal/MurmurHash2';
import {TokenNode} from '../src/provenance/token/TokenNode';

describe('murmurhash2', () => {
  const str42 = '42';
  const num42 = 42;
  const hashFor42 = '10011000101001111000010010110';
  const seed = 0;
  const seed2 = 1;

  it('check if result is a string', () => {
    // @see string check from http://stackoverflow.com/a/4891964/940219
    return expect(Object.prototype.toString.call(murmurhash2(str42, seed)))
      .toEqual('[object String]');
  });

  it('compare generated hash to static value', () => {
    return expect(murmurhash2(str42, seed))
      .toEqual(hashFor42);
  });

  it('check reproducibility of hash', () => {
    return expect(murmurhash2(str42, seed))
      .toEqual(murmurhash2(str42, seed));
  });

  it('check cast from number to string', () => {
    return expect(murmurhash2(num42, seed))
      .toEqual(murmurhash2(str42, seed));
  });

  it('check if different seed return different hash', () => {
    return expect(murmurhash2(str42, seed))
      .not.toEqual(murmurhash2(str42, seed2));
  });
});

describe('TokenNode', () => {

  const tokenNode = new TokenNode('key', 'value');
  const hashForValue = '11100001110101100100000010110101';

  it('default weight is 1', () => {
    return expect(tokenNode.weight).toEqual(1);
  });

  it('compare hash to static value', () => {
    return expect(tokenNode.toHash()).toEqual(hashForValue);
  });

});
