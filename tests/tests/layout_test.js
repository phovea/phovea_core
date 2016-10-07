define(["require", "exports", 'layout'], function (require, exports, layout) {
  exports.test = function(){

    QUnit.module('layout', function() {

      QUnit.test('Object.keys', function(assert) {
        assert.deepEqual(Object.keys(layout).sort(), [
          "ALayoutElem",
          "borderLayout",
          "distributeLayout",
          "flowLayout",
          "layers",
          "no_padding",
          "wrapDOM"
        ]);
      });

      /* TODO: Add at least one test for layout.ALayoutElem
      QUnit.module('ALayoutElem', function() {
        QUnit.test('???', function(assert) {
          assert.equal(layout.ALayoutElem(), '???');
        });
      })
      */

      /* TODO: Add at least one test for layout.borderLayout
      QUnit.module('borderLayout', function() {
        QUnit.test('???', function(assert) {
          assert.equal(layout.borderLayout(), '???');
        });
      })
      */

      /* TODO: Add at least one test for layout.distributeLayout
      QUnit.module('distributeLayout', function() {
        QUnit.test('???', function(assert) {
          assert.equal(layout.distributeLayout(), '???');
        });
      })
      */

      /* TODO: Add at least one test for layout.flowLayout
      QUnit.module('flowLayout', function() {
        QUnit.test('???', function(assert) {
          assert.equal(layout.flowLayout(), '???');
        });
      })
      */

      /* TODO: Add at least one test for layout.layers
      QUnit.module('layers', function() {
        QUnit.test('???', function(assert) {
          assert.equal(layout.layers(), '???');
        });
      })
      */

      /* TODO: Add at least one test for layout.no_padding
      QUnit.module('no_padding', function() {
        QUnit.test('???', function(assert) {
          assert.equal(layout.no_padding(), '???');
        });
      })
      */

      /* TODO: Add at least one test for layout.wrapDOM
      QUnit.module('wrapDOM', function() {
        QUnit.test('???', function(assert) {
          assert.equal(layout.wrapDOM(), '???');
        });
      })
      */

    });

  }
});
