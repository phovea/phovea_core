define(["require", "exports", 'session'], function (require, exports, session) {
  exports.test = function(){

    QUnit.module('session', function() {

      QUnit.test('Object.keys', function(assert) {
        assert.deepEqual(Object.keys(session).sort(), [
          "has",
          "remove",
          "retrieve",
          "store"
        ]);
      });

    });

  }
});
