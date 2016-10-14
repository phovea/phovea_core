define(["require", "exports", 'behavior'], function (require, exports, behavior) {
  exports.test = function(){

    QUnit.module('behavior', function() {

      QUnit.test('Object.keys', function(assert) {
        assert.deepEqual(Object.keys(behavior).sort(), [
          "ZoomBehavior",
          "ZoomLogic"
        ]);
      });

      function properties(object) {
        var props = [];
        for (p in object) {
          props.push(p);
        }
        return props.sort();
      }

      QUnit.module('ZoomBehavior', function() {
        QUnit.test('properties', function(assert) {
          document.getElementById('qunit-fixture').innerHTML = '<div id="fake">foo bar</div>';
          var node = document.getElementById('fake');
          var v, meta;
          var zb = new behavior.ZoomBehavior(node, v, meta);
          assert.deepEqual(properties(zb), [
            "constructor",
            "fire",
            "fireEvent",
            "handlers",
            "isFixedAspectRatio",
            "isHeightFixed",
            "isWidthFixed",
            "list",
            "meta",
            "node",
            "off",
            "on",
            "propagate",
            "v",
            "zoom",
            "zoomIn",
            "zoomOut",
            "zoomSet",
            "zoomTo"
          ]);
        });

      });

      QUnit.module('ZoomLogic', function() {
        QUnit.test('properties', function(assert) {
          var v, meta;
          var zl = new behavior.ZoomLogic(v, meta);
          assert.deepEqual(properties(zl), [
            "constructor",
            "fire",
            "fireEvent",
            "handlers",
            "isFixedAspectRatio",
            "isHeightFixed",
            "isWidthFixed",
            "list",
            "meta",
            "off",
            "on",
            "propagate",
            "v",
            "zoom",
            "zoomIn",
            "zoomOut",
            "zoomSet",
            "zoomTo"
          ]);
        });
      });

    });

  }
});
