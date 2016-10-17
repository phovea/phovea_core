define(["require", "exports", 'ajax'], function (require, exports, ajax) {
  exports.test = function(){

    QUnit.module('ajax', function() {

      QUnit.test('Object.keys', function(assert) {
        assert.deepEqual(Object.keys(ajax).sort(), [
          "api2absURL",
          "encodeParams",
          "getAPIData",
          "getAPIJSON",
          "getData",
          "getJSON",
          "send",
          "sendAPI"
        ]);
      });

      QUnit.module('api2absURL', function() {
        // TODO: test that C.server_url and C.server_json_suffix are used.
        QUnit.test('no query', function(assert) {
          assert.equal(ajax.api2absURL('/path'), '/api/path');
        });
        QUnit.test('empty query', function(assert) {
          assert.equal(ajax.api2absURL('/path', {}), '/api/path');
        });
        QUnit.test('query', function(assert) {
          assert.equal(ajax.api2absURL('/path', {foo: 'bar'}), '/api/path?foo=bar');
        });
        QUnit.test('url w/ query', function(assert) {
          assert.equal(ajax.api2absURL('/path?query=fake', {foo: 'bar'}), '/api/path?query=fake&foo=bar');
        });
      });

      QUnit.module('encodeParams', function() {
        QUnit.test('null', function(assert) {
          assert.equal(ajax.encodeParams(null), null);
        });
        QUnit.test('empty array', function(assert) {
          assert.equal(ajax.encodeParams([]), null);
        });
        QUnit.test('full array', function(assert) {
          assert.equal(ajax.encodeParams(['99% & \\', '\u2603', '2+2', 4]), '0=99%25+%26+%5C&1=%E2%98%83&2=2%2B2&3=4');
        });
        QUnit.test('hash', function(assert) {
          assert.equal(ajax.encodeParams({foo: 'bar'}), 'foo=bar');
        });
        QUnit.test('hash of array', function(assert) {
          assert.equal(ajax.encodeParams({foo: ['b', 'a', 'r']}), 'foo%5B%5D=b&foo%5B%5D=a&foo%5B%5D=r');
        });
        QUnit.test('hash of hash', function(assert) {
          assert.equal(ajax.encodeParams({foo: [{nested: true}, 'bar']}), 'foo%5B0%5D%5Bnested%5D=true&foo%5B%5D=bar');
        });
      });

      /* TODO: Add at least one test for ajax.getAPIData
      QUnit.module('getAPIData', function() {
        QUnit.test('???', function(assert) {
          assert.equal(ajax.getAPIData(), '???');
        });
      })
      */

      /* TODO: Add at least one test for ajax.getAPIJSON
      QUnit.module('getAPIJSON', function() {
        QUnit.test('???', function(assert) {
          assert.equal(ajax.getAPIJSON(), '???');
        });
      })
      */

      /* TODO: Add at least one test for ajax.getData
      QUnit.module('getData', function() {
        QUnit.test('???', function(assert) {
          assert.equal(ajax.getData(), '???');
        });
      })
      */

      /* TODO: Add at least one test for ajax.getJSON
      QUnit.module('getJSON', function() {
        QUnit.test('???', function(assert) {
          assert.equal(ajax.getJSON(), '???');
        });
      })
      */

      /* TODO: Add at least one test for ajax.send
      QUnit.module('send', function() {
        QUnit.test('???', function(assert) {
          assert.equal(ajax.send(), '???');
        });
      })
      */

      /* TODO: Add at least one test for ajax.sendAPI
      QUnit.module('sendAPI', function() {
        QUnit.test('???', function(assert) {
          assert.equal(ajax.sendAPI(), '???');
        });
      })
      */

    });

  }
});

