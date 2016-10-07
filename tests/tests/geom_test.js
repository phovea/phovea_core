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

    });

  }
});
