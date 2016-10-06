define(["require", "exports", 'plugin'], function (require, exports, plugin) {
  exports.test = function(){

    QUnit.module('plugin', function() {

      QUnit.test('Object.keys', function(assert) {
        assert.deepEqual(Object.keys(plugin).sort(), [
          "get",
          "list",
          "load",
          "push",
          "pushAll"
        ]);
      });

    });

  }
});
