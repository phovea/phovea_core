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

    });

  }
});
