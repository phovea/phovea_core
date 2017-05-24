/**
 * Created by Samuel Gratzl on 07.03.2017.
 */
/// <reference types="jasmine" />
import {fix} from '../../../src/range/internal';

describe('fix', () => {
  it('constant', () => expect(fix(1,10)).toBe(1));
  it('constant negative size', () => expect(fix(10,-1)).toBe(10));
  it('constant negative size', () => expect(fix(10,NaN)).toBe(10));
  it('fix -1', () => expect(fix(-1,10)).toBe(10));
  it('fix -2', () => expect(fix(-2,10)).toBe(9));
  it('fix -1 NaN', () => expect(fix(-1, NaN)).toBeNaN());
  it('fix -8', () => expect(fix(-8, 10)).toBe(3));
   // TODO  what should be the defined behavior?
  it('fix -13',()  => expect(fix(-13, 10)).toBe(-2));
});
