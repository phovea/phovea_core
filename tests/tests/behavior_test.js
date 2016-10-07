define(["require", "exports", 'behavior'], function (require, exports, behavior) {
  exports.test = function(){

    QUnit.module('behavior', function() {

      QUnit.test('Object.keys', function(assert) {
        assert.deepEqual(Object.keys(behavior).sort(), [
          "ZoomBehavior",
          "ZoomLogic"
        ]);
      });

      /* TODO: Add at least one test for behavior.ZoomBehavior
      QUnit.module('ZoomBehavior', function() {
        QUnit.test('???', function(assert) {
          assert.equal(behavior.ZoomBehavior(), '???');
        });
      })
      */

      /* TODO: Add at least one test for behavior.ZoomLogic
      QUnit.module('ZoomLogic', function() {
        QUnit.test('???', function(assert) {
          assert.equal(behavior.ZoomLogic(), '???');
        });
      })
      */

    });

  }
});
