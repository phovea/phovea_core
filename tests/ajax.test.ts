import {api2absURL} from '../src/ajax';

describe('api2absURL', () => {
  describe('one arg', () => {
    it('no query', () => expect(api2absURL('/path')).toEqual('/api/path'));
  });
  describe('empty query', () => {
    it('no query', () => expect(api2absURL('/path', {})).toEqual('/api/path'));
  });
  describe('query', () => {
    it('no query', () => expect(api2absURL('/path', {foo: 'bar'})).toEqual('/api/path?foo=bar'));
  });
  describe('url w/ query', () => {
    it('no query', () => expect(api2absURL('/path?query=fake', {foo: 'bar'})).toEqual('/api/path?query=fake&foo=bar'));
  });
});
