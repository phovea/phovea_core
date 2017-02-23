/**
 * Created by Holger Stitz on 23.02.2017.
 */

import {HashBuilder, murmurhash2_32_gc} from '../src/provenance/internal/HashBuilder';
import {murmurhash2_32_gc} from '../src/provenance/internal/HashBuilder';

describe('murmurhash2_32_gc', () => {
  const str42 = '42';
  const num42 = 42;
  const hashFor42 = '10011000101001111000010010110';
  const seed = 0;
  const seed2 = 1;

  it('check if result is a string', () => {
    // @see string check from http://stackoverflow.com/a/4891964/940219
    return expect(Object.prototype.toString.call(murmurhash2_32_gc(str42, seed)))
      .toEqual('[object String]');
  });

  it('compare generated hash to static value', () => {
    return expect(murmurhash2_32_gc(str42, seed))
      .toEqual(hashFor42);
  });

  it('check reproducibility of hash', () => {
    return expect(murmurhash2_32_gc(str42, seed))
      .toEqual(murmurhash2_32_gc(str42, seed));
  });

  it('check cast from number to string', () => {
    return expect(murmurhash2_32_gc(num42, seed))
      .toEqual(murmurhash2_32_gc(str42, seed));
  });

  it('check if different seed return different hash', () => {
    return expect(murmurhash2_32_gc(str42, seed))
      .not.toEqual(murmurhash2_32_gc(str42, seed2));
  });
});
});
