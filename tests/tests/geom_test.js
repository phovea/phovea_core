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
        var circle = new geom.Circle(1,1,1);
        QUnit.test('properties', function(assert) {
          assert.deepEqual(properties(circle), [
            "aabb",
            "asIntersectionParams",
            "bs",
            "center",
            "constructor",
            "corner",
            "intersects",
            "radius",
            "shift",
            "shiftImpl",
            "toString",
            "transform",
            "x",
            "xy",
            "y"
          ]);
        });
        QUnit.test('aabb', function(assert) {
          var aabb = circle.aabb();
          assert.equal(aabb.x, 0);
          assert.equal(aabb.x2, 2);
          assert.equal(aabb.y, 0);
          assert.equal(aabb.y2, 2);
          assert.equal(aabb.h, 2);
          assert.equal(aabb.w, 2);
          // TODO: more
        });
        QUnit.test('asIntersectionParams', function(assert) {
          var params = circle.asIntersectionParams();
          assert.equal(params.name, 'Circle');
          assert.equal(params.params[0].x, 1);
          assert.equal(params.params[0].y, 1);
          assert.equal(params.params[1], 1); // TODO: Is this the radius?
          // TODO: more
        });
        // QUnit.test('bs', function(assert) { TODO: What does this mean?
        //   assert.deepEqual(circle.bs(), '???');
        // });
        QUnit.test('center', function(assert) {
          assert.deepEqual(circle.center.x, 1);
          assert.deepEqual(circle.center.y, 1);
        });
        QUnit.test('corner', function(assert) {
          // TODO: Bug? A circle shouldn't have corners? How is this used?
          assert.deepEqual(circle.corner().toString(), '1,1');
        });
        QUnit.test('intersects', function(assert) {
          function assert_intersect(x,y,r,reverse) {
            if (typeof reverse == 'undefined') {
              reverse = true;
            }
            var other = new geom.Circle(x, y, r);
            var intersection = circle.intersects(other);
            if (!reverse) {
              assert.ok(!intersection.intersects);
            } else {
              assert.ok(intersection.intersects);
            }
          }
          assert_intersect(1,1,1); // same
          assert_intersect(-1,-1,1, false); // outside
          assert_intersect(-1,1,1); // touch
          assert_intersect(0,0,1); // overlap
          // TODO: Bug? Maybe intersection means the line of the circle edge,
          // rather than the interior of the disk?
          assert_intersect(1,1,0.5, false); // smaller
          assert_intersect(1,1,2, false); // larger
          // TODO: Test other methods of intersection object
        });
        QUnit.test('radius', function(assert) {
          assert.deepEqual(circle.radius, 1);
        });
        // QUnit.test('shift', function(assert) {
        //   assert.deepEqual(circle.shift(), '???');
        // });
        // QUnit.test('shiftImpl', function(assert) {
        //   assert.deepEqual(circle.shiftImpl(), '???');
        // });
        QUnit.test('toString', function(assert) {
          assert.deepEqual(circle.toString(), 'Circle(x=1,y=1,radius=1)');
        });
        // QUnit.test('transform', function(assert) {
        //   assert.deepEqual(circle.transform(), '???');
        // });
        QUnit.test('x', function(assert) {
          assert.deepEqual(circle.x, 1);
        });
        QUnit.test('y', function(assert) {
          assert.deepEqual(circle.y, 1);
        });
        QUnit.test('xy', function(assert) {
          // TODO: How is this different from .center?
          assert.deepEqual(circle.xy.x, 1);
          assert.deepEqual(circle.xy.y, 1);
          // TODO: more
        });
      });

      QUnit.module('Ellipse', function() {
        var ellipse = new geom.Ellipse(1, 1, 1, 2);
        QUnit.test('properties', function (assert) {
          assert.deepEqual(properties(ellipse), [
            "aabb",
            "asIntersectionParams",
            "bs",
            "center",
            "constructor",
            "corner",
            "intersects",
            "radiusX",
            "radiusY",
            "shift",
            "shiftImpl",
            "toString",
            "transform",
            "x",
            "xy",
            "y"
          ]);
        });

        // TODO
      });

      QUnit.module('Line', function() {
        var line = new geom.Line(0, 0, 1, 1);
        QUnit.test('properties', function (assert) {
          assert.deepEqual(properties(line), [
            "aabb",
            "asIntersectionParams",
            "bs",
            "center",
            "constructor",
            "corner",
            "intersects",
            "shift",
            "shiftImpl",
            "toString",
            "transform",
            "x1",
            "x1y1",
            "x2",
            "x2y2",
            "xy",
            "y1",
            "y2"
          ]);
        });

        // TODO
      });

     QUnit.module('Polygon', function() {
        var polygon = new geom.Polygon([]);
        QUnit.test('properties', function (assert) {
          assert.deepEqual(properties(polygon), [
            "aabb",
            "area",
            "asIntersectionParams",
            "bs",
            "center",
            "centroid",
            "constructor",
            "corner",
            "intersects",
            "isClockwise",
            "isConcave",
            "isConvex",
            "isCounterClockwise",
            "length",
            "pointInPolygon",
            "points",
            "push",
            "shift",
            "shiftImpl",
            "toString",
            "transform"
          ]);
        });

        // TODO
      });

     QUnit.module('Rect', function() {
        var rect = new geom.Rect(1,1,1,2);
        QUnit.test('properties', function (assert) {
          assert.deepEqual(properties(rect), [
            "aabb",
            "asIntersectionParams",
            "bs",
            "center",
            "constructor",
            "corner",
            "cx",
            "cy",
            "eq",
            "h",
            "intersects",
            "shift",
            "shiftImpl",
            "size",
            "toString",
            "transform",
            "w",
            "x",
            "x2",
            "x2y2",
            "xy",
            "y",
            "y2"
          ]);
        });

        // TODO
      });

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
