import {argFilter, argSort, mod} from '../src';

describe('argFilter', () => {
  it('evens', () => {
    expect(argFilter([1, 3, 5, 2, 4, 6, 7, 9, 11], (d) => d % 2 === 0))
      .toEqual([3, 4, 5]);
  });
});


describe('argSort', () => {
  it('simple', () => {
    expect(argSort(['lizard', 'marsupial', 'cat', 'dolphin'], (a, b) => a.length - b.length))
      .toEqual([2, 0, 3, 1]);
  });
});

describe('mode', () => {
  it('+ % +', () => {
    expect(mod(101, 5)).toEqual(1);
  });
  it('- % + (native)', () => {
    expect(-101 % 5).toEqual(-1);
  });
  it('- % +', () => {
    expect(mod(-101, 5)).toEqual(4);
  });
  it('+ % -', () => {
    expect(mod(101, -5)).toEqual(-4);
  });
  it('- % -', () => {
    expect(mod(-101, -5)).toEqual(-1);
  });
});
