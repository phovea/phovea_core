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

  describe('asIntersectionParams', () => {
    var params = circle.asIntersectionParams();
    it('name', () => expect(params.name).toEqual('Circle'));
    it('name', () => expect(params.params[0].x).toEqual(1));
    it('name', () => expect(params.params[0].y).toEqual(1));
    it('name', () => expect(params.params[1]).toEqual(1));  // TODO: Is this the radius?
  });

  describe('center', () => {
    it('x', () => expect(circle.center.x).toEqual(1));
    it('y', () => expect(circle.center.y).toEqual(1));
  });

  describe('bs', () => {
    // "bounding sphere"
    it('toString', () => expect(circle.bs().toString()).toEqual('Circle(x=1,y=1,radius=1)'))
  });

  describe('corner', () => {
    function corner(label, expected) {
      it(label, () => expect(circle.corner(CORNER[label]).toString()).toEqual(expected));
    }
    corner('NW', '0,0');
    corner('NE', '2,0');
    corner('SE', '2,2');
    corner('SW', '0,2');
    corner('N', '1,0');
    corner('S', '1,2');
    corner('E', '2,1');
    corner('W', '0,1');
  });

  describe('intersects', () => {
    it('self', () => expect(circle.intersects(new Circle(1,1,1))));
    it('outside', () => expect(! circle.intersects(new Circle(-1,-1,1))));
    it('touch', () => expect(circle.intersects(new Circle(-1,1,1))));
    it('overlap', () => expect(circle.intersects(new Circle(0,0,1))));
    it('smaller', () => expect(! circle.intersects(new Circle(1,1,0.5))));
    it('larger', () => expect(! circle.intersects(new Circle(1,1,2))));
  });

  it('radius', () => expect(circle.radius).toEqual(1));
  it('toString', () => expect(circle.toString()).toEqual('Circle(x=1,y=1,radius=1)'));
  it('x', () => expect(circle.x).toEqual(1));
  it('y', () => expect(circle.y).toEqual(1));
  it('xy', () => expect(circle.xy.toString()).toEqual('1,1'));

  // it('shift', () => expect(circle.shift()).toEqual('???'));
  // it('shiftImpl', () => expect(circle.shiftImpl()).toEqual('???'));
  // TODO: shiftImpl modifies object in place. Would immutability be a good thing?

});
