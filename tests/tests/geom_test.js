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
            // TODO: Do we really need both the constructors and these functions?
            // It would be different if we sometimes reused objects, instead of making new ones.
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

      QUnit.module('Circle', function() {
        var circle = new geom.Circle(0,0,1);
        QUnit.test('aabb', function(assert) {
          var aabb = circle.aabb();
          assert.equal(aabb.x, -1);
          assert.equal(aabb.x2, 1);
          assert.equal(aabb.y, -1);
          assert.equal(aabb.y2, 1);
          assert.equal(aabb.h, 2);
          assert.equal(aabb.w, 2);
        });
        // QUnit.test('asIntersectionParams', function(assert) {
        //   assert.deepEqual(circle.asIntersectionParams(), '???');
        // });
        // QUnit.test('bs', function(assert) {
        //   assert.deepEqual(circle.bs(), '???');
        // });
        // QUnit.test('center', function(assert) {
        //   assert.deepEqual(circle.center(), '???');
        // });
        // QUnit.test('corner', function(assert) {
        //   assert.deepEqual(circle.corner(), '???');
        // });
        // QUnit.test('intersects', function(assert) {
        //   assert.deepEqual(circle.intersects(), '???');
        // });
        // QUnit.test('radius', function(assert) {
        //   assert.deepEqual(circle.radius(), '???');
        // });
        // QUnit.test('shift', function(assert) {
        //   assert.deepEqual(circle.shift(), '???');
        // });
        // QUnit.test('shiftImpl', function(assert) {
        //   assert.deepEqual(circle.shiftImpl(), '???');
        // });
        // QUnit.test('toString', function(assert) {
        //   assert.deepEqual(circle.toString(), '???');
        // });
        // QUnit.test('transform', function(assert) {
        //   assert.deepEqual(circle.transform(), '???');
        // });
        // QUnit.test('x', function(assert) {
        //   assert.deepEqual(circle.x, '???');
        // });
        // QUnit.test('y', function(assert) {
        //   assert.deepEqual(circle.y, '???');
        // });
        // QUnit.test('xy', function(assert) {
        //   assert.deepEqual(circle.xy, '???');
        // });
      });

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
