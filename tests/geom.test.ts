import {Circle, CORNER} from '../src/geom';

describe('Circle', () => {
  var circle = new Circle(1,1,1);
  describe('aabb', () => {
    var aabb = circle.aabb();
    it('x', () => expect(aabb.x).toEqual(0));
    it('x2', () => expect(aabb.x2).toEqual(2));
    it('y', () => expect(aabb.y).toEqual(0));
    it('y2', () => expect(aabb.y2).toEqual(2));
    it('h', () => expect(aabb.h).toEqual(2));
    it('w', () => expect(aabb.w).toEqual(2));
    // TODO: more
  });

  // TODO: "Circle asIntersectionParams encountered a declaration exception FAILED"
  // describe('asIntersectionParams', () => {
  //   var params = circle.asIntersectionParams();
  //   it('name', () => expect(params.name).toEqual('Circle'));
  //   it('name', () => expect(params.params[0].x).toEqual(1));
  //   it('name', () => expect(params.params[0].y).toEqual(1));
  //   it('name', () => expect(params.params[1]).toEqual(1));  // TODO: Is this the radius?
  //   // TODO: more
  // });

  // TODO: "RangeError: Maximum call stack size exceeded"
  // describe('center', () => {
  //   it('x', () => expect(circle.center.x).toEqual(1));
  //   it('y', () => expect(circle.center.y).toEqual(1));
  // });

  // QUnit.test('bs', function(assert) { TODO: What does this mean?
  //   assert.deepEqual(circle.bs(), '???');
  // });

  // TODO: "RangeError: Maximum call stack size exceeded"
  // describe('corner', () => {
  //   var corner = circle.corner(CORNER.NW);
  //   it('toString', () => expect(corner.toString).toEqual('1,1'));
  // });

  // TODO: "RangeError: Maximum call stack size exceeded"
  // describe('intersects', () => {
  //   it('self', () => expect(circle.intersects(new Circle(1,1,1))))
  // });

      //   QUnit.test('intersects', function(assert) {
      //     function assert_intersect(x,y,r,reverse) {
      //       if (typeof reverse == 'undefined') {
      //         reverse = true;
      //       }
      //       var other = new geom.Circle(x, y, r);
      //       var intersection = circle.intersects(other);
      //       if (!reverse) {
      //         assert.ok(!intersection.intersects);
      //       } else {
      //         assert.ok(intersection.intersects);
      //       }
      //     }
      //     assert_intersect(1,1,1); // same
      //     assert_intersect(-1,-1,1, false); // outside
      //     assert_intersect(-1,1,1); // touch
      //     assert_intersect(0,0,1); // overlap
      //     // TODO: Bug? Maybe intersection means the line of the circle edge,
      //     // rather than the interior of the disk?
      //     assert_intersect(1,1,0.5, false); // smaller
      //     assert_intersect(1,1,2, false); // larger
      //     // TODO: Test other methods of intersection object
      //   });
      //   QUnit.test('radius', function(assert) {
      //     assert.deepEqual(circle.radius, 1);
      //   });
      //   // QUnit.test('shift', function(assert) {
      //   //   assert.deepEqual(circle.shift(), '???');
      //   // });
      //   // QUnit.test('shiftImpl', function(assert) {
      //   //   assert.deepEqual(circle.shiftImpl(), '???');
      //   // });
      //   QUnit.test('toString', function(assert) {
      //     assert.deepEqual(circle.toString(), 'Circle(x=1,y=1,radius=1)');
      //   });
      //   // QUnit.test('transform', function(assert) {
      //   //   assert.deepEqual(circle.transform(), '???');
      //   // });
      //   QUnit.test('x', function(assert) {
      //     assert.deepEqual(circle.x, 1);
      //   });
      //   QUnit.test('y', function(assert) {
      //     assert.deepEqual(circle.y, 1);
      //   });
      //   QUnit.test('xy', function(assert) {
      //     // TODO: How is this different from .center?
      //     assert.deepEqual(circle.xy.x, 1);
      //     assert.deepEqual(circle.xy.y, 1);
      //     // TODO: more
      //   });
      // });

});
