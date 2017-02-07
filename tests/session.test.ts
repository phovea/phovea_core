/// <reference types="jasmine" />
import {has, retrieve, store, remove} from '../src/session';

describe('methods', () => {
  const key = 'test-key';
  it('invalid key', () => {
    expect(has(key)).toBe(false);
  });
  it('valid key', () => {
    store(key, 'foobar');
    expect(has(key)).toBe(true);
    expect(retrieve(key)).toBe('foobar');
  });
  it('overrite key', () => {
    store(key, 'barfoo');
    expect(has(key)).toBe(true);
    expect(retrieve(key)).toBe('barfoo');
  });
  it('remove key', () => {
    remove(key);
    expect(has(key)).toBe(false);
  });
});

describe('data types', () => {
  function checkStore(data: any) {
    it(typeof data, () => {
      const key = 'key';
      store(key, data);
      expect(retrieve(key)).toEqual(data);
    });
  }
  checkStore(1);
  checkStore(['array']);
  checkStore({'hash': true});
});
