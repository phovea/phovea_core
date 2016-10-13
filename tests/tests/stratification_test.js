define(["require", "exports", 'stratification'], function (require, exports, stratification) {
  exports.test = function(){

    QUnit.module('stratification', function() {

      QUnit.test('Object.keys', function(assert) {
        assert.deepEqual(Object.keys(stratification).sort(), [
          "StratificationGroup",
          "guessColor"
        ]);
      });

      /* TODO: Add at least one test for stratification.StratificationGroup
      QUnit.module('StratificationGroup', function() {
        QUnit.test('???', function(assert) {
          assert.equal(stratification.StratificationGroup(), '???');
        });
      })
      */

      /* TODO: Add at least one test for stratification.guessColor
      QUnit.module('guessColor', function() {
        QUnit.test('???', function(assert) {
          assert.equal(stratification.guessColor(), '???');
        });
      })
      */


    });

  }
});
