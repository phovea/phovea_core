define(["require", "exports", 'geom'], function (require, exports, geom) {
  exports.test = function(){

    /*
    TODO: CORNER is limited to core... make private?
    */

    /*
    TODO: Circle is limited to core... make private?
    */

    /*
    TODO: Ellipse is limited to core... make private?
    */

    /* Line external usages: TODO: but none of these refer to this class; private?
     caleydo_d3/link.ts:  line: d3.svg.Line<any>;
     caleydo_importer/parser.ts:  skipEmptyLines: true
     caleydo_vis/axis.ts:  private scale:d3.scale.Linear<number, number>;
     caleydo_vis/barplot.ts:  private xscale:d3.scale.Linear<number, number>;
     caleydo_vis/barplot.ts:  private yscale:d3.scale.Linear<number, number>;
     caleydo_vis/box.ts:  private scale:d3.scale.Linear<number, number>;
     caleydo_vis/distribution.ts:  private yscale:d3.scale.Linear<number, number>;
     caleydo_vis/distribution.ts:  private scale:d3.scale.Linear<number, number>;
     gapminder/gapminder.ts:    this.updateTimeLine();
     gapminder/gapminder.ts:      this.updateHoverLine(ids);
     gapminder/gapminder.ts:      this.updateSelectionLines(ids);
     gapminder/gapminder.ts:  private updateHoverLine(ids: number[], animate = false) {
     gapminder/gapminder.ts:  private updateSelectionLines(ids:number[], animate = false) {
     gapminder/gapminder.ts:      this.updateHoverLine(r.rowtype.selections(idtypes.hoverSelectionType).dim(0).asList(), true);
     gapminder/gapminder.ts:      this.updateSelectionLines(r.rowtype.selections().dim(0).asList(), true);
     gapminder/gapminder.ts:  private updateTimeLine() {
     */

    /* Polygon external usages: TODO: but none of these refer to this class; private?
     caleydo_vis/distribution.ts:function toPolygon(start:number, end:number, radius:number) {
     caleydo_vis/distribution.ts:      return Promise.resolve(toPolygon(startAngle, endAngle, o.radius));
     */

    /* Rect external usages: TODO: but none of these refer to this class; private?
     caleydo_d3/layout_d3util.ts:class SVGRectLayoutElem extends layout.ALayoutElem implements layout.ILayoutElem {
     caleydo_d3/layout_d3util.ts:  private targetBounds : geom.Rect = null;
     caleydo_d3/layout_d3util.ts:export function wrapSVGRect($elem: d3.Selection<any>, options:any = {}) {
     caleydo_d3/layout_d3util.ts:  return new SVGRectLayoutElem($elem, options);
     caleydo_d3/link.ts:  createBand(aBounds: geom.Rect, bBounds: geom.Rect, aIDs: ranges.Range1D, bIDs: ranges.Range1D, union: ranges.Range1D, id: string, clazz : string) : ILink[];
     caleydo_d3/link.ts:  (context: IBandContext, a: IVisWrapper, aa: geom.Rect, b: IVisWrapper, bb: geom.Rect): Promise<ILink[]>;
     caleydo_d3/link.ts:  createBand(aa: geom.Rect, bb: geom.Rect, ida: ranges.Range1D, idb: ranges.Range1D, union: ranges.Range1D, id: string, clazz : string) {
     caleydo_d3/link.ts:  private shouldRender(a: VisWrapper, aa: geom.Rect, b: VisWrapper, bb: geom.Rect) {
     caleydo_d3/link_representation.ts:export function createBlockRep(context: link.IBandContext, a: link.IVisWrapper, aa: geom.Rect, b: link.IVisWrapper, bb: geom.Rect):Promise<link.ILink[]> {
     caleydo_d3/link_representation.ts:export function createGroupRep(context: link.IBandContext, a: link.IVisWrapper, aa: geom.Rect, b: link.IVisWrapper, bb: geom.Rect):Promise<link.ILink[]> {
     caleydo_d3/link_representation.ts:export function createItemRep(context: link.IBandContext, a: link.IVisWrapper, aa: geom.Rect, b: link.IVisWrapper, bb: geom.Rect):Promise<link.ILink[]> {
     caleydo_vis/heatmap.ts:    ctx.clearRect(0, 0, canvas.width, canvas.height);
     caleydo_vis/heatmap.ts:      ctx.fillRect(0,0, canvas.width, canvas.height);
     caleydo_vis/heatmap.ts:        ctx.fillRect(j,i, 1, 1);
     caleydo_vis/heatmap.ts:        rect = c.getBoundingClientRect();
     */

    /*
    TODO: ellipse is limited to core... make private?
    */

    /* polygon external usages:
     caleydo_d3/link.ts:    var shape = geom.polygon(aa.corner('ne'), bb.corner('nw'), bb.corner('sw'), aa.corner('se'));
     caleydo_vis/distribution.ts:  return geom.polygon(r);
     */

    /* vec2 external usages:
     caleydo_vis/distribution.ts:    geom.vec2(radius, radius),
     caleydo_vis/distribution.ts:    geom.vec2(radius + Math.cos(start) * radius, radius + Math.sin(start) * radius),
     caleydo_vis/distribution.ts:    geom.vec2(radius + Math.cos(end) * radius, radius + Math.sin(end) * radius)
     caleydo_vis/distribution.ts:    r.splice(2, 0, geom.vec2(radius + Math.cos((end - start) * 0.5) * radius, radius + Math.sin((end - start) * 0.5) * radius));
     */


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

        /* TODO: Add at least one test for ellipse.aabb
        QUnit.module('aabb', function() {
          QUnit.test('???', function(assert) {
            assert.equal(ellipse.aabb(), '???');
          });
        });
        */

        /* TODO: Add at least one test for ellipse.asIntersectionParams
        QUnit.module('asIntersectionParams', function() {
          QUnit.test('???', function(assert) {
            assert.equal(ellipse.asIntersectionParams(), '???');
          });
        });
        */

        /* TODO: Add at least one test for ellipse.bs
        QUnit.module('bs', function() {
          QUnit.test('???', function(assert) {
            assert.equal(ellipse.bs(), '???');
          });
        });
        */

        /* TODO: Add at least one test for ellipse.center
        QUnit.module('center', function() {
          QUnit.test('???', function(assert) {
            assert.equal(ellipse.center(), '???');
          });
        });
        */

        /* TODO: Add at least one test for ellipse.constructor
        QUnit.module('constructor', function() {
          QUnit.test('???', function(assert) {
            assert.equal(ellipse.constructor(), '???');
          });
        });
        */

        /* TODO: Add at least one test for ellipse.corner
        QUnit.module('corner', function() {
          QUnit.test('???', function(assert) {
            assert.equal(ellipse.corner(), '???');
          });
        });
        */

        /* TODO: Add at least one test for ellipse.intersects
        QUnit.module('intersects', function() {
          QUnit.test('???', function(assert) {
            assert.equal(ellipse.intersects(), '???');
          });
        });
        */

        /* TODO: Add at least one test for ellipse.radiusX
        QUnit.module('radiusX', function() {
          QUnit.test('???', function(assert) {
            assert.equal(ellipse.radiusX(), '???');
          });
        });
        */

        /* TODO: Add at least one test for ellipse.radiusY
        QUnit.module('radiusY', function() {
          QUnit.test('???', function(assert) {
            assert.equal(ellipse.radiusY(), '???');
          });
        });
        */

        /* TODO: Add at least one test for ellipse.shift
        QUnit.module('shift', function() {
          QUnit.test('???', function(assert) {
            assert.equal(ellipse.shift(), '???');
          });
        });
        */

        /* TODO: Add at least one test for ellipse.shiftImpl
        QUnit.module('shiftImpl', function() {
          QUnit.test('???', function(assert) {
            assert.equal(ellipse.shiftImpl(), '???');
          });
        });
        */

        /* TODO: Add at least one test for ellipse.toString
        QUnit.module('toString', function() {
          QUnit.test('???', function(assert) {
            assert.equal(ellipse.toString(), '???');
          });
        });
        */

        /* TODO: Add at least one test for ellipse.transform
        QUnit.module('transform', function() {
          QUnit.test('???', function(assert) {
            assert.equal(ellipse.transform(), '???');
          });
        });
        */

        /* TODO: Add at least one test for ellipse.x
        QUnit.module('x', function() {
          QUnit.test('???', function(assert) {
            assert.equal(ellipse.x(), '???');
          });
        });
        */

        /* TODO: Add at least one test for ellipse.xy
        QUnit.module('xy', function() {
          QUnit.test('???', function(assert) {
            assert.equal(ellipse.xy(), '???');
          });
        });
        */

        /* TODO: Add at least one test for ellipse.y
        QUnit.module('y', function() {
          QUnit.test('???', function(assert) {
            assert.equal(ellipse.y(), '???');
          });
        });
        */
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

        /* TODO: Add at least one test for line.aabb
        QUnit.module('aabb', function() {
          QUnit.test('???', function(assert) {
            assert.equal(line.aabb(), '???');
          });
        });
        */

        /* TODO: Add at least one test for line.asIntersectionParams
        QUnit.module('asIntersectionParams', function() {
          QUnit.test('???', function(assert) {
            assert.equal(line.asIntersectionParams(), '???');
          });
        });
        */

        /* TODO: Add at least one test for line.bs
        QUnit.module('bs', function() {
          QUnit.test('???', function(assert) {
            assert.equal(line.bs(), '???');
          });
        });
        */

        /* TODO: Add at least one test for line.center
        QUnit.module('center', function() {
          QUnit.test('???', function(assert) {
            assert.equal(line.center(), '???');
          });
        });
        */

        /* TODO: Add at least one test for line.constructor
        QUnit.module('constructor', function() {
          QUnit.test('???', function(assert) {
            assert.equal(line.constructor(), '???');
          });
        });
        */

        /* TODO: Add at least one test for line.corner
        QUnit.module('corner', function() {
          QUnit.test('???', function(assert) {
            assert.equal(line.corner(), '???');
          });
        });
        */

        /* TODO: Add at least one test for line.intersects
        QUnit.module('intersects', function() {
          QUnit.test('???', function(assert) {
            assert.equal(line.intersects(), '???');
          });
        });
        */

        /* TODO: Add at least one test for line.shift
        QUnit.module('shift', function() {
          QUnit.test('???', function(assert) {
            assert.equal(line.shift(), '???');
          });
        });
        */

        /* TODO: Add at least one test for line.shiftImpl
        QUnit.module('shiftImpl', function() {
          QUnit.test('???', function(assert) {
            assert.equal(line.shiftImpl(), '???');
          });
        });
        */

        /* TODO: Add at least one test for line.toString
        QUnit.module('toString', function() {
          QUnit.test('???', function(assert) {
            assert.equal(line.toString(), '???');
          });
        });
        */

        /* TODO: Add at least one test for line.transform
        QUnit.module('transform', function() {
          QUnit.test('???', function(assert) {
            assert.equal(line.transform(), '???');
          });
        });
        */

        /* TODO: Add at least one test for line.x1
        QUnit.module('x1', function() {
          QUnit.test('???', function(assert) {
            assert.equal(line.x1(), '???');
          });
        });
        */

        /* TODO: Add at least one test for line.x1y1
        QUnit.module('x1y1', function() {
          QUnit.test('???', function(assert) {
            assert.equal(line.x1y1(), '???');
          });
        });
        */

        /* TODO: Add at least one test for line.x2
        QUnit.module('x2', function() {
          QUnit.test('???', function(assert) {
            assert.equal(line.x2(), '???');
          });
        });
        */

        /* TODO: Add at least one test for line.x2y2
        QUnit.module('x2y2', function() {
          QUnit.test('???', function(assert) {
            assert.equal(line.x2y2(), '???');
          });
        });
        */

        /* TODO: Add at least one test for line.xy
        QUnit.module('xy', function() {
          QUnit.test('???', function(assert) {
            assert.equal(line.xy(), '???');
          });
        });
        */

        /* TODO: Add at least one test for line.y1
        QUnit.module('y1', function() {
          QUnit.test('???', function(assert) {
            assert.equal(line.y1(), '???');
          });
        });
        */

        /* TODO: Add at least one test for line.y2
        QUnit.module('y2', function() {
          QUnit.test('???', function(assert) {
            assert.equal(line.y2(), '???');
          });
        });
        */

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

        /* TODO: Add at least one test for polygon.aabb
        QUnit.module('aabb', function() {
          QUnit.test('???', function(assert) {
            assert.equal(polygon.aabb(), '???');
          });
        });
        */

        /* TODO: Add at least one test for polygon.area
        QUnit.module('area', function() {
          QUnit.test('???', function(assert) {
            assert.equal(polygon.area(), '???');
          });
        });
        */

        /* TODO: Add at least one test for polygon.asIntersectionParams
        QUnit.module('asIntersectionParams', function() {
          QUnit.test('???', function(assert) {
            assert.equal(polygon.asIntersectionParams(), '???');
          });
        });
        */

        /* TODO: Add at least one test for polygon.bs
        QUnit.module('bs', function() {
          QUnit.test('???', function(assert) {
            assert.equal(polygon.bs(), '???');
          });
        });
        */

        /* TODO: Add at least one test for polygon.center
        QUnit.module('center', function() {
          QUnit.test('???', function(assert) {
            assert.equal(polygon.center(), '???');
          });
        });
        */

        /* TODO: Add at least one test for polygon.centroid
        QUnit.module('centroid', function() {
          QUnit.test('???', function(assert) {
            assert.equal(polygon.centroid(), '???');
          });
        });
        */

        /* TODO: Add at least one test for polygon.constructor
        QUnit.module('constructor', function() {
          QUnit.test('???', function(assert) {
            assert.equal(polygon.constructor(), '???');
          });
        });
        */

        /* TODO: Add at least one test for polygon.corner
        QUnit.module('corner', function() {
          QUnit.test('???', function(assert) {
            assert.equal(polygon.corner(), '???');
          });
        });
        */

        /* TODO: Add at least one test for polygon.intersects
        QUnit.module('intersects', function() {
          QUnit.test('???', function(assert) {
            assert.equal(polygon.intersects(), '???');
          });
        });
        */

        /* TODO: Add at least one test for polygon.isClockwise
        QUnit.module('isClockwise', function() {
          QUnit.test('???', function(assert) {
            assert.equal(polygon.isClockwise(), '???');
          });
        });
        */

        /* TODO: Add at least one test for polygon.isConcave
        QUnit.module('isConcave', function() {
          QUnit.test('???', function(assert) {
            assert.equal(polygon.isConcave(), '???');
          });
        });
        */

        /* TODO: Add at least one test for polygon.isConvex
        QUnit.module('isConvex', function() {
          QUnit.test('???', function(assert) {
            assert.equal(polygon.isConvex(), '???');
          });
        });
        */

        /* TODO: Add at least one test for polygon.isCounterClockwise
        QUnit.module('isCounterClockwise', function() {
          QUnit.test('???', function(assert) {
            assert.equal(polygon.isCounterClockwise(), '???');
          });
        });
        */

        /* TODO: Add at least one test for polygon.length
        QUnit.module('length', function() {
          QUnit.test('???', function(assert) {
            assert.equal(polygon.length(), '???');
          });
        });
        */

        /* TODO: Add at least one test for polygon.pointInPolygon
        QUnit.module('pointInPolygon', function() {
          QUnit.test('???', function(assert) {
            assert.equal(polygon.pointInPolygon(), '???');
          });
        });
        */

        /* TODO: Add at least one test for polygon.points
        QUnit.module('points', function() {
          QUnit.test('???', function(assert) {
            assert.equal(polygon.points(), '???');
          });
        });
        */

        /* TODO: Add at least one test for polygon.push
        QUnit.module('push', function() {
          QUnit.test('???', function(assert) {
            assert.equal(polygon.push(), '???');
          });
        });
        */

        /* TODO: Add at least one test for polygon.shift
        QUnit.module('shift', function() {
          QUnit.test('???', function(assert) {
            assert.equal(polygon.shift(), '???');
          });
        });
        */

        /* TODO: Add at least one test for polygon.shiftImpl
        QUnit.module('shiftImpl', function() {
          QUnit.test('???', function(assert) {
            assert.equal(polygon.shiftImpl(), '???');
          });
        });
        */

        /* TODO: Add at least one test for polygon.toString
        QUnit.module('toString', function() {
          QUnit.test('???', function(assert) {
            assert.equal(polygon.toString(), '???');
          });
        });
        */

        /* TODO: Add at least one test for polygon.transform
        QUnit.module('transform', function() {
          QUnit.test('???', function(assert) {
            assert.equal(polygon.transform(), '???');
          });
        });
        */

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

        /* TODO: Add at least one test for line.aabb
        QUnit.module('aabb', function() {
          QUnit.test('???', function(assert) {
            assert.equal(line.aabb(), '???');
          });
        });
        */

        /* TODO: Add at least one test for line.asIntersectionParams
        QUnit.module('asIntersectionParams', function() {
          QUnit.test('???', function(assert) {
            assert.equal(line.asIntersectionParams(), '???');
          });
        });
        */

        /* TODO: Add at least one test for line.bs
        QUnit.module('bs', function() {
          QUnit.test('???', function(assert) {
            assert.equal(line.bs(), '???');
          });
        });
        */

        /* TODO: Add at least one test for line.center
        QUnit.module('center', function() {
          QUnit.test('???', function(assert) {
            assert.equal(line.center(), '???');
          });
        });
        */

        /* TODO: Add at least one test for line.constructor
        QUnit.module('constructor', function() {
          QUnit.test('???', function(assert) {
            assert.equal(line.constructor(), '???');
          });
        });
        */

        /* TODO: Add at least one test for line.corner
        QUnit.module('corner', function() {
          QUnit.test('???', function(assert) {
            assert.equal(line.corner(), '???');
          });
        });
        */

        /* TODO: Add at least one test for line.cx
        QUnit.module('cx', function() {
          QUnit.test('???', function(assert) {
            assert.equal(line.cx(), '???');
          });
        });
        */

        /* TODO: Add at least one test for line.cy
        QUnit.module('cy', function() {
          QUnit.test('???', function(assert) {
            assert.equal(line.cy(), '???');
          });
        });
        */

        /* TODO: Add at least one test for line.eq
        QUnit.module('eq', function() {
          QUnit.test('???', function(assert) {
            assert.equal(line.eq(), '???');
          });
        });
        */

        /* TODO: Add at least one test for line.h
        QUnit.module('h', function() {
          QUnit.test('???', function(assert) {
            assert.equal(line.h(), '???');
          });
        });
        */

        /* TODO: Add at least one test for line.intersects
        QUnit.module('intersects', function() {
          QUnit.test('???', function(assert) {
            assert.equal(line.intersects(), '???');
          });
        });
        */

        /* TODO: Add at least one test for line.shift
        QUnit.module('shift', function() {
          QUnit.test('???', function(assert) {
            assert.equal(line.shift(), '???');
          });
        });
        */

        /* TODO: Add at least one test for line.shiftImpl
        QUnit.module('shiftImpl', function() {
          QUnit.test('???', function(assert) {
            assert.equal(line.shiftImpl(), '???');
          });
        });
        */

        /* TODO: Add at least one test for line.size
        QUnit.module('size', function() {
          QUnit.test('???', function(assert) {
            assert.equal(line.size(), '???');
          });
        });
        */

        /* TODO: Add at least one test for line.toString
        QUnit.module('toString', function() {
          QUnit.test('???', function(assert) {
            assert.equal(line.toString(), '???');
          });
        });
        */

        /* TODO: Add at least one test for line.transform
        QUnit.module('transform', function() {
          QUnit.test('???', function(assert) {
            assert.equal(line.transform(), '???');
          });
        });
        */

        /* TODO: Add at least one test for line.w
        QUnit.module('w', function() {
          QUnit.test('???', function(assert) {
            assert.equal(line.w(), '???');
          });
        });
        */

        /* TODO: Add at least one test for line.x
        QUnit.module('x', function() {
          QUnit.test('???', function(assert) {
            assert.equal(line.x(), '???');
          });
        });
        */

        /* TODO: Add at least one test for line.x2
        QUnit.module('x2', function() {
          QUnit.test('???', function(assert) {
            assert.equal(line.x2(), '???');
          });
        });
        */

        /* TODO: Add at least one test for line.x2y2
        QUnit.module('x2y2', function() {
          QUnit.test('???', function(assert) {
            assert.equal(line.x2y2(), '???');
          });
        });
        */

        /* TODO: Add at least one test for line.xy
        QUnit.module('xy', function() {
          QUnit.test('???', function(assert) {
            assert.equal(line.xy(), '???');
          });
        });
        */

        /* TODO: Add at least one test for line.y
        QUnit.module('y', function() {
          QUnit.test('???', function(assert) {
            assert.equal(line.y(), '???');
          });
        });
        */

        /* TODO: Add at least one test for line.y2
        QUnit.module('y2', function() {
          QUnit.test('???', function(assert) {
            assert.equal(line.y2(), '???');
          });
        });
        */
      });

      /* TODO: Add at least one test for geom.circle (but maybe the constructor is enough?)
      QUnit.module('circle', function() {
        QUnit.test('???', function(assert) {
          assert.equal(geom.circle(), '???');
        });
      })
      */

      /* TODO: Add at least one test for geom.ellipse (but maybe the constructor is enough?)
      QUnit.module('ellipse', function() {
        QUnit.test('???', function(assert) {
          assert.equal(geom.ellipse(), '???');
        });
      })
      */

      /* TODO: Add at least one test for geom.line (but maybe the constructor is enough?)
      QUnit.module('line', function() {
        QUnit.test('???', function(assert) {
          assert.equal(geom.line(), '???');
        });
      })
      */

      /* TODO: Add at least one test for geom.polygon (but maybe the constructor is enough?)
      QUnit.module('polygon', function() {
        QUnit.test('???', function(assert) {
          assert.equal(geom.polygon(), '???');
        });
      })
      */

      /* TODO: Add at least one test for geom.rect (but maybe the constructor is enough?)
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
