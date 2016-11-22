import {Circle, Rect, Ellipse, CORNER} from '../src/geom';

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
    it('x', () => expect(params.params[0].x).toEqual(1));
    it('y', () => expect(params.params[0].y).toEqual(1));
    it('r', () => expect(params.params[1]).toEqual(1));
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
  // "bounding sphere"
  it('bs', () => expect(circle.bs().toString()).toEqual('Circle(x=1,y=1,radius=1)'));
  it('center', () => expect(circle.center.toString()).toEqual('1,1'));

  // TODO: Perhaps a transformed circle should be an ellipse?
  it('transform', () => expect(circle.transform([2,0],0).toString()).toEqual('Circle(x=2,y=0,radius=1)'));

  // it('shift', () => expect(circle.shift()).toEqual('???'));
  // it('shiftImpl', () => expect(circle.shiftImpl()).toEqual('???'));
  // TODO: shiftImpl modifies object in place. Would immutability be a good thing?
});

describe('Rect', () => {
  var rect = new Rect(0,0,2,2);
  describe('aabb', () => {
    var aabb = rect.aabb();
    it('x', () => expect(aabb.x).toEqual(0));
    it('x2', () => expect(aabb.x2).toEqual(2));
    it('y', () => expect(aabb.y).toEqual(0));
    it('y2', () => expect(aabb.y2).toEqual(2));
    it('h', () => expect(aabb.h).toEqual(2));
    it('w', () => expect(aabb.w).toEqual(2));
    // TODO: more
  });

  describe('asIntersectionParams', () => {
    var params = rect.asIntersectionParams();
    it('name', () => expect(params.name).toEqual('Rectangle'));
    it('x', () => expect(params.params[0].x).toEqual(0));
    it('y', () => expect(params.params[0].y).toEqual(0));
    it('x', () => expect(params.params[1].x).toEqual(2));
    it('y', () => expect(params.params[1].y).toEqual(2));
  });

  describe('corner', () => {
    function corner(label, expected) {
      it(label, () => expect(rect.corner(CORNER[label]).toString()).toEqual(expected));
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
    it('self', () => expect(rect.intersects(new Rect(0,0,2,2))));
    it('outside', () => expect(! rect.intersects(new Rect(-1,-1,4,4))));
    it('inside', () => expect(! rect.intersects(new Rect(0.5,0.5,1,1))));
    it('touch', () => expect(rect.intersects(new Rect(-1,-1,1,1))));
    it('overlap', () => expect(rect.intersects(new Rect(-1,-1,2,2))));
  });

  it('toString', () => expect(rect.toString()).toEqual('Rect(x=0,y=0,w=2,h=2)'));
  it('x', () => expect(rect.x).toEqual(0));
  it('y', () => expect(rect.y).toEqual(0));
  it('xy', () => expect(rect.xy.toString()).toEqual('0,0'));
  // "bounding sphere"
  it('bs', () => expect(rect.bs().toString()).toMatch(/Circle.x=1,y=1,radius=2.828/)); // TODO: radius twice what it should be?
  it('center', () => expect(rect.center.toString()).toEqual('1,1'));

  it('transform', () => expect(rect.transform([2,1],0).toString()).toEqual('Rect(x=0,y=0,w=4,h=2)'));

  // it('shift', () => expect(rect.shift()).toEqual('???'));
  // it('shiftImpl', () => expect(rect.shiftImpl()).toEqual('???'));
  // TODO: shiftImpl modifies object in place. Would immutability be a good thing?
});

describe('Ellipse', () => {
  var ellipse = new Ellipse(1,2,1,2);
  describe('aabb', () => {
    var aabb = ellipse.aabb();
    it('x', () => expect(aabb.x).toEqual(0));
    it('x2', () => expect(aabb.x2).toEqual(2));
    it('y', () => expect(aabb.y).toEqual(0));
    it('y2', () => expect(aabb.y2).toEqual(4));
    it('h', () => expect(aabb.h).toEqual(4));
    it('w', () => expect(aabb.w).toEqual(2));
    // TODO: more
  });

  describe('asIntersectionParams', () => {
    var params = ellipse.asIntersectionParams();
    it('name', () => expect(params.name).toEqual('Ellipse'));
    it('x', () => expect(params.params[0].x).toEqual(1));
    it('y', () => expect(params.params[0].y).toEqual(2));
    it('w', () => expect(params.params[1]).toEqual(1));
    it('h', () => expect(params.params[2]).toEqual(2));
  });

  describe('corner', () => {
    function corner(label, expected) {
      it(label, () => expect(ellipse.corner(CORNER[label]).toString()).toEqual(expected));
    }
    corner('NW', '0,0');
    corner('NE', '2,0');
    corner('SE', '2,4');
    corner('SW', '0,4');
    corner('N', '1,0');
    corner('S', '1,4');
    corner('E', '2,2');
    corner('W', '0,2');
  });

  describe('intersects', () => {
    it('self', () => expect(ellipse.intersects(new Rect(0,0,2,2))));
    it('outside', () => expect(! ellipse.intersects(new Rect(-1,-1,4,4))));
    it('inside', () => expect(! ellipse.intersects(new Rect(0.5,0.5,1,1))));
    it('touch', () => expect(ellipse.intersects(new Rect(-1,-1,1,1))));
    it('overlap', () => expect(ellipse.intersects(new Rect(-1,-1,2,2))));
  });

  it('toString', () => expect(ellipse.toString()).toEqual('Ellipse(x=1,y=2,radiusX=1NaN2)')); // TODO: NaN is bad
  it('x', () => expect(ellipse.x).toEqual(1));
  it('y', () => expect(ellipse.y).toEqual(2));
  it('xy', () => expect(ellipse.xy.toString()).toEqual('1,2'));
  // "bounding sphere"
  it('bs', () => expect(ellipse.bs().toString()).toMatch(/Circle.x=1,y=2,radius=2/)); // TODO: radius twice what it should be?
  it('center', () => expect(ellipse.center.toString()).toEqual('1,2'));

  it('transform', () => expect(ellipse.transform([2,1],0).toString()).toEqual('Ellipse(x=2,y=2,radiusX=2NaN1)'));

  it('radiusX', () => expect(ellipse.radiusX).toEqual(1));
  it('radiusY', () => expect(ellipse.radiusY).toEqual(2));

  // it('shift', () => expect(rect.shift()).toEqual('???'));
  // it('shiftImpl', () => expect(rect.shiftImpl()).toEqual('???'));
  // TODO: shiftImpl modifies object in place. Would immutability be a good thing?
});

describe('Ellipse', () => {

});

describe('Polygon', () => {

});

describe('Line', () => {

});
