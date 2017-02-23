/**
 * Created by Holger Stitz on 23.02.2017.
 */

import {HashBuilder, murmurhash2_32_gc} from '../src/provenance/internal/HashBuilder';

describe('murmurhash2_32_gc', () => {
  it('compare generated hash to static value', () => expect(murmurhash2_32_gc('42', 0)).toEqual('10011000101001111000010010110'));
  it('check reproducibility of hash', () => expect(murmurhash2_32_gc('42', 0)).toEqual(murmurhash2_32_gc('42', 0)));
  it('check cast from number to string', () => expect(murmurhash2_32_gc(42, 0)).toEqual(murmurhash2_32_gc('42', 0)));
});
