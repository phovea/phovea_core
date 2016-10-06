define(["require", "exports", 'behavior'], function (require, exports, behavior) {
  exports.test = function(){

    QUnit.module('behavior', function() {

      QUnit.test('Object.keys', function(assert) {
        assert.deepEqual(Object.keys(behavior).sort(), [
          "ZoomBehavior",
          "ZoomLogic"
        ]);
      });

    });

  }
});
