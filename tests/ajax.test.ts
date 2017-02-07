/// <reference types="jasmine" />
import {api2absURL, encodeParams} from '../src/ajax';

describe('api2absURL', () => {
  it('one arg',
      () => expect(api2absURL('/path')).toEqual('/api/path'));
  it('empty query',
      () => expect(api2absURL('/path', {})).toEqual('/api/path'));
  it('query',
      () => expect(api2absURL('/path', {foo: 'bar'})).toEqual('/api/path?foo=bar'));
  it('url w/ query',
      () => expect(api2absURL('/path?query=fake', {foo: 'bar'})).toEqual('/api/path?query=fake&foo=bar'));
});

describe('encodeParams', () => {
  it('null',
      () => expect(encodeParams(null)).toEqual(null));
  it('empty array',
      () => expect(encodeParams([])).toEqual(null));
  it('full array',
      () => expect(encodeParams(['99% & \\', '\u2603', '2+2', 4])).toEqual('0=99%25+%26+%5C&1=%E2%98%83&2=2%2B2&3=4'));
  it('hash',
      () => expect(encodeParams({foo: 'bar'})).toEqual('foo=bar'));
  it('hash of array',
      () => expect(encodeParams({foo: ['b', 'a', 'r']})).toEqual('foo%5B%5D=b&foo%5B%5D=a&foo%5B%5D=r'));
  it('hash of hash',
      () => expect(encodeParams({foo: [{nested: true}, 'bar']})).toEqual('foo%5B0%5D%5Bnested%5D=true&foo%5B%5D=bar'));
});

/* TODO: Add at least one test for ajax.getAPIData */

/* TODO: Add at least one test for ajax.getAPIJSON */

/* TODO: Add at least one test for ajax.getData */

/* TODO: Add at least one test for ajax.getJSON */

/* TODO: Add at least one test for ajax.send */
