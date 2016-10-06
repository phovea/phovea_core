define(["require", "exports", 'layout_view'], function (require, exports, layout_view) {
  exports.test = function(){

    QUnit.module('layout_view', function() {

      QUnit.test('Object.keys', function(assert) {
        assert.deepEqual(Object.keys(layout_view).sort(), [
          "AView",
          "list"
        ]);
      });

    });

  }
});
