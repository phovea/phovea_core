/**
 * Created by Samuel Gratzl on 07.03.2017.
 */
/// <reference types="jasmine" />
import RangeElem from '../../../src/range/internal/RangeElem';

describe('RangeElem', () => {
  describe('from', () => {
    it('default', () => expect(new RangeElem(0).from).toBe(0));
    it('set value', () => expect(new RangeElem(2).from).toBe(2));
  });
  describe('to', () => {
    it('default', () => expect(new RangeElem(0).to).toBe(-1));
    it('set value', () => expect(new RangeElem(0, 2).to).toBe(2));
  });
  describe('step', () => {
    it('default', () => expect(new RangeElem(0).step).toBe(1));
    it('set value', () => expect(new RangeElem(0, 2, 1).step).toBe(1));
    it('set value', () => expect(new RangeElem(0, 2, 2).step).toBe(2));
  });
  describe('isAll', () => {
    it('default', () => expect(new RangeElem(0).isAll).toBeTruthy());
    it('explicit', () => expect(new RangeElem(0, -1).isAll).toBeTruthy());
    it('explicit full', () => expect(new RangeElem(0, -1, 1).isAll).toBeTruthy());
    it('not', () => expect(new RangeElem(1).isAll).not.toBeTruthy());
    it('not explicit', () => expect(new RangeElem(0, 5).isAll).not.toBeTruthy());
    it('not explicit full', () => expect(new RangeElem(0, -1, 2).isAll).not.toBeTruthy());
  });
  describe('isSingle', () => {
    it('default', () => expect(new RangeElem(0).isSingle).not.toBeTruthy());
    it('all', () => expect(new RangeElem(0, -1).isSingle).not.toBeTruthy());
    it('single 0:1', () => expect(new RangeElem(0, 1).isSingle).toBeTruthy());
    it('single 1:2', () => expect(new RangeElem(1, 2).isSingle).toBeTruthy());
    it('single 4:6:2', () => expect(new RangeElem(4, 6, 2).isSingle).toBeTruthy());
    it('single 6:5:-1', () => expect(new RangeElem(6, 5, -1).isSingle).toBeTruthy());
  });
  describe('isUnbound', () => {
    it('default', () => expect(new RangeElem(0).isUnbound).toBeTruthy());
    it('explicit', () => expect(new RangeElem(0, -1).isUnbound).toBeTruthy());
    it('bound', () => expect(new RangeElem(0, 2).isUnbound).not.toBeTruthy());
    it('unbound negative start', () => expect(new RangeElem(-2, 2).isUnbound).toBeTruthy());
  });

  describe('all', () => {
    const elem = RangeElem.all();
    it('isAll', () => expect(elem.isAll).toBeTruthy());
    it('!isSingle', () => expect(elem.isSingle).not.toBeTruthy());
    it('isUnbound', () => expect(elem.isUnbound).toBeTruthy());
    it('from', () => expect(elem.from).toBe(0));
    it('to', () => expect(elem.to).toBe(-1));
    it('step', () => expect(elem.step).toBe(1));
    it('size', () => expect(elem.size(10)).toBe(10));
  });
  describe('none', () => {
    const elem = RangeElem.none();
    it('!isAll', () => expect(elem.isAll).not.toBeTruthy());
    it('!isSingle', () => expect(elem.isSingle).not.toBeTruthy());
    it('!isUnbound', () => expect(elem.isUnbound).not.toBeTruthy());
    it('from', () => expect(elem.from).toBe(0));
    it('to', () => expect(elem.to).toBe(0));
    it('step', () => expect(elem.step).toBe(1));
    it('size', () => expect(elem.size()).toBe(0));
  });
  describe('single', () => {
    const elem = RangeElem.single(5);
    it('!isAll', () => expect(elem.isAll).not.toBeTruthy());
    it('isSingle', () => expect(elem.isSingle).toBeTruthy());
    it('!isUnbound', () => expect(elem.isUnbound).not.toBeTruthy());
    it('from', () => expect(elem.from).toBe(5));
    it('to', () => expect(elem.to).toBe(6));
    it('step', () => expect(elem.step).toBe(1));
    it('size', () => expect(elem.size()).toBe(1));
  });
  describe('size', () => {
    it('default', () => expect(new RangeElem(0).size()).toBeNaN);
    it('default', () => expect(new RangeElem(0).size(10)).toBe(10));
    it('unbound 10', () => expect(new RangeElem(0, -1).size(10)).toBe(10));
    it('unbound 10_2', () => expect(new RangeElem(2, -1).size(10)).toBe(8));
    it('range 2:5', () => expect(new RangeElem(2, 5).size()).toBe(3));
    it('range 2:6:2', () => expect(new RangeElem(2, 6, 2).size()).toBe(2));
  });
  // TODO further tests
});
