import {api2absURL} from '../src/ajax';

describe('api2absURL', () => {
  it('no query', () => expect(api2absURL('/path')).toEqual('/api/path'));
});
