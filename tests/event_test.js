define(["require", "exports", 'event'], function (require, exports, event) {
  exports.test = function(){

    QUnit.module('event', function() {

      QUnit.test('Object.keys', function(assert) {
        assert.deepEqual(Object.keys(event), [
          "EventHandler",
          "on",
          "off",
          "fire",
          "list"
        ]);
      });

    });

  }
});

