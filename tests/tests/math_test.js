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

      /* TODO: Add at least one test for math.categoricalHist
      QUnit.module('categoricalHist', function() {
        QUnit.test('???', function(assert) {
          assert.equal(math.categoricalHist(), '???');
        });
      })
      */

      /* TODO: Add at least one test for math.computeStats
      QUnit.module('computeStats', function() {
        QUnit.test('???', function(assert) {
          assert.equal(math.computeStats(), '???');
        });
      })
      */

      /* TODO: Add at least one test for math.hist
      QUnit.module('hist', function() {
        QUnit.test('???', function(assert) {
          assert.equal(math.hist(), '???');
        });
      })
      */

      /* TODO: Add at least one test for math.rangeHist
      QUnit.module('rangeHist', function() {
        QUnit.test('???', function(assert) {
          assert.equal(math.rangeHist(), '???');
        });
      })
      */

      /* TODO: Add at least one test for math.wrapHist
      QUnit.module('wrapHist', function() {
        QUnit.test('???', function(assert) {
          assert.equal(math.wrapHist(), '???');
        });
      })
      */



    });

  }
});
