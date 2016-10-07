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

      /* TODO: Add at least one test for ajax.api2absURL
      QUnit.module('api2absURL', function() {
        QUnit.test('???', function(assert) {
          assert.equal(ajax.api2absURL(), '???');
        });
      })
      */

      /* TODO: Add at least one test for ajax.encodeParams
      QUnit.module('encodeParams', function() {
        QUnit.test('???', function(assert) {
          assert.equal(ajax.encodeParams(), '???');
        });
      })
      */

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

