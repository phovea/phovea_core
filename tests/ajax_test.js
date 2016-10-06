define(["require", "exports", 'ajax'], function (require, exports, ajax) {
  exports.test = function(){

    QUnit.module('ajax', function() {

      QUnit.test('Object.keys', function(assert) {
        assert.deepEqual(Object.keys(ajax), [
          "send",
          "getJSON",
          "getData",
          "api2absURL",
          "encodeParams",
          "sendAPI",
          "getAPIJSON",
          "getAPIData"
        ]);
      });

    });

  }
});

