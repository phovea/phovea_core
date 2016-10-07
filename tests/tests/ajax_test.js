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

      /* TODO
      QUnit.module('api2absURL', function() {
        QUnit.test('???', function(assert) {
          assert.equal(ajax.api2absURL(), '???');
        });
      })
      */

      /* TODO
      QUnit.module('encodeParams', function() {
        QUnit.test('???', function(assert) {
          assert.equal(ajax.encodeParams(), '???');
        });
      })
      */

      /* TODO
      QUnit.module('getAPIData', function() {
        QUnit.test('???', function(assert) {
          assert.equal(ajax.getAPIData(), '???');
        });
      })
      */

      /* TODO
      QUnit.module('getAPIJSON', function() {
        QUnit.test('???', function(assert) {
          assert.equal(ajax.getAPIJSON(), '???');
        });
      })
      */

      /* TODO
      QUnit.module('getData', function() {
        QUnit.test('???', function(assert) {
          assert.equal(ajax.getData(), '???');
        });
      })
      */

      /* TODO
      QUnit.module('getJSON', function() {
        QUnit.test('???', function(assert) {
          assert.equal(ajax.getJSON(), '???');
        });
      })
      */

      /* TODO
      QUnit.module('send', function() {
        QUnit.test('???', function(assert) {
          assert.equal(ajax.send(), '???');
        });
      })
      */

      /* TODO
      QUnit.module('sendAPI', function() {
        QUnit.test('???', function(assert) {
          assert.equal(ajax.sendAPI(), '???');
        });
      })
      */

    });

  }
});

