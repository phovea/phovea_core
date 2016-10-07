define(["require", "exports", 'vector_impl'], function (require, exports, vector_impl) {
  exports.test = function(){

    QUnit.module('vector_impl', function() {

      QUnit.test('Object.keys', function(assert) {
        assert.deepEqual(Object.keys(vector_impl).sort(), [
          "StratificationVector",
          "Vector",
          "VectorBase",
          "create",
          "wrap"
        ]);
      });

    });

  }
});
