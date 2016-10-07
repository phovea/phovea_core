define(["require", "exports", 'stratification'], function (require, exports, stratification) {
  exports.test = function(){

    QUnit.module('stratification', function() {

      QUnit.test('Object.keys', function(assert) {
        assert.deepEqual(Object.keys(stratification).sort(), [
          "StratificationGroup",
          "guessColor"
        ]);
      });

    });

  }
});
