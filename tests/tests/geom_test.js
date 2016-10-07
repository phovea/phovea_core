define(["require", "exports", 'geom'], function (require, exports, geom) {
  exports.test = function(){

    QUnit.module('geom', function() {

      QUnit.test('Object.keys', function(assert) {
        assert.deepEqual(Object.keys(geom).sort(), [
          "AShape",
          "CORNER",
          "Circle",
          "Ellipse",
          "Line",
          "Polygon",
          "Rect",
          "circle",
          "ellipse",
          "line",
          "polygon",
          "rect",
          "vec",
          "vec2",
          "wrap"
        ]);
      });

      /* TODO: Add at least one test for geom.AShape
      QUnit.module('AShape', function() {
        QUnit.test('???', function(assert) {
          assert.equal(geom.AShape(), '???');
        });
      })
      */

      /* TODO: Add at least one test for geom.CORNER
      QUnit.module('CORNER', function() {
        QUnit.test('???', function(assert) {
          assert.equal(geom.CORNER(), '???');
        });
      })
      */

      /* TODO: Add at least one test for geom.Circle
      QUnit.module('Circle', function() {
        QUnit.test('???', function(assert) {
          assert.equal(geom.Circle(), '???');
        });
      })
      */

      /* TODO: Add at least one test for geom.Ellipse
      QUnit.module('Ellipse', function() {
        QUnit.test('???', function(assert) {
          assert.equal(geom.Ellipse(), '???');
        });
      })
      */

      /* TODO: Add at least one test for geom.Line
      QUnit.module('Line', function() {
        QUnit.test('???', function(assert) {
          assert.equal(geom.Line(), '???');
        });
      })
      */

      /* TODO: Add at least one test for geom.Polygon
      QUnit.module('Polygon', function() {
        QUnit.test('???', function(assert) {
          assert.equal(geom.Polygon(), '???');
        });
      })
      */

      /* TODO: Add at least one test for geom.Rect
      QUnit.module('Rect', function() {
        QUnit.test('???', function(assert) {
          assert.equal(geom.Rect(), '???');
        });
      })
      */

      /* TODO: Add at least one test for geom.circle
      QUnit.module('circle', function() {
        QUnit.test('???', function(assert) {
          assert.equal(geom.circle(), '???');
        });
      })
      */

      /* TODO: Add at least one test for geom.ellipse
      QUnit.module('ellipse', function() {
        QUnit.test('???', function(assert) {
          assert.equal(geom.ellipse(), '???');
        });
      })
      */

      /* TODO: Add at least one test for geom.line
      QUnit.module('line', function() {
        QUnit.test('???', function(assert) {
          assert.equal(geom.line(), '???');
        });
      })
      */

      /* TODO: Add at least one test for geom.polygon
      QUnit.module('polygon', function() {
        QUnit.test('???', function(assert) {
          assert.equal(geom.polygon(), '???');
        });
      })
      */

      /* TODO: Add at least one test for geom.rect
      QUnit.module('rect', function() {
        QUnit.test('???', function(assert) {
          assert.equal(geom.rect(), '???');
        });
      })
      */

      /* TODO: Add at least one test for geom.vec
      QUnit.module('vec', function() {
        QUnit.test('???', function(assert) {
          assert.equal(geom.vec(), '???');
        });
      })
      */

      /* TODO: Add at least one test for geom.vec2
      QUnit.module('vec2', function() {
        QUnit.test('???', function(assert) {
          assert.equal(geom.vec2(), '???');
        });
      })
      */

      /* TODO: Add at least one test for geom.wrap
      QUnit.module('wrap', function() {
        QUnit.test('???', function(assert) {
          assert.equal(geom.wrap(), '???');
        });
      })
      */

    });

  }
});
