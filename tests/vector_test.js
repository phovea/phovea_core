define(["require", "exports", 'vector'], function (require, exports, vector) {
  exports.test = function(){

    QUnit.module('vector', function() {

      QUnit.test('Object.keys', function(assert) {
        assert.deepEqual(Object.keys(vector).sort(), [
          // TODO
        ]);
      });

    });

  }
});
