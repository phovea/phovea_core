/**
 * Created by Holger Stitz on 23.02.2017.
 */

import {murmurhash2} from '../src/provenance/internal/MurmurHash2';
import {TokenNode, TokenRootNode} from '../src/provenance/token/TokenNode';

describe('murmurhash2', () => {
  const str42 = '42';
  const str84 = '84';
  const num42 = 42;
  const seed = 0;
  const seed2 = 1;

  it('check if result is a string', () => {
    // @see string check from http://stackoverflow.com/a/4891964/940219
    return expect(Object.prototype.toString.call(murmurhash2(str42, seed)))
      .toEqual('[object String]');
  });

  it('compare generated hash to static value', () => {
    return expect(murmurhash2(str42, seed))
      .toEqual('10011000101001111000010010110');
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

  it('check if different strings return different hash', () => {
    return expect(murmurhash2(str42, seed))
      .not.toEqual(murmurhash2(str84, seed));
  });

  it('check if `val1a` and `val2a` are not equal', () => {
    return expect(murmurhash2('val1a', seed))
      .not.toEqual(murmurhash2('val2a', seed));
  });

  // generates same hash for different values --> malfunction
  it('check if `value1a` and `value2a` are not equal', () => {
    return expect(murmurhash2('value1a', seed))
      .toEqual(murmurhash2('value2a', seed));
  });

});

describe('token tree', () => {
  const root = new TokenRootNode('root');

  const child1 = new TokenNode('child1', root, 'val1');
  const child1a = new TokenNode('child1a', child1, 'val1a');
  const child1b = new TokenNode('child1b', child1, 'val1b');

  const child2 = new TokenNode('child2', root, 'val2');
  const child2a = new TokenNode('child2a', child2, 'val2a');
  const child2b = new TokenNode('child2b', child2, 'val2b');
  const child2c = new TokenNode('child2c', child2, 'val2c');

  describe('basic functionality', () => {
    it('root has default weight == 1', () => {
      return expect(root.weight).toEqual(1);
    });

    it('root has empty value', () => {
      return expect(root.value).toEqual('');
    });

    it('root has child1', () => {
      return expect(root.has(child1.name)).toBeTruthy();
    });

    it('root contains child2', () => {
      return expect(root.children()).toContain(child2);
    });

    it('root not contains child2a', () => {
      return expect(root.children()).not.toContain(child2a);
    });

    it('check fqname for child1', () => {
      return expect(child1.fqname).toEqual('child1.root');
    });
  });

  describe('flatten tree', () => {
    it('check if list contains self', () => {
      return expect(root.flatten()).toContain(root);
    });

    it('check length of root', () => {
      return expect(root.flatten().length).toEqual(8);
    });

    it('check for child2b', () => {
      return expect(root.flatten()).toContain(child2a);
    });

    it('check length of child1', () => {
      return expect(child1.flatten().length).toEqual(3);
    });
  });

  describe('contains hash', () => {
    const hash = murmurhash2('val1b', 0);
    const scope = root.children()[1];

    it('find node for hash in root (shallow)', () => {
      return expect(root.findNodeByHash(hash)).not.toContain(child1b);
    });

    it('find node for hash in root (deep)', () => {
      return expect(root.findNodeByHash(hash, true)).toContain(child1b);
    });

    it('scope node is equal to child2', () => {
      return expect(scope).toEqual(child2);
    });

    it('do not find node for hash in child2', () => {
      return expect(scope.findNodeByHash(hash).length).toEqual(0);
    });

  });

});
