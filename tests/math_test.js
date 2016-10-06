define(["require", "exports", 'math'], function (require, exports, math) {
  exports.test = function(){

    QUnit.module('math', function() {

      QUnit.test('Object.keys', function(assert) {
        assert.deepEqual(Object.keys(math).sort(), [
          "categoricalHist",
          "computeStats",
          "hist",
          "rangeHist",
          "wrapHist"
        ]);
      });

    });

  }
});
