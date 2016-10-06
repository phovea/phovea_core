define(["require", "exports", 'matrix_impl'], function (require, exports, matrix_impl) {
  exports.test = function(){

    QUnit.module('matrix_impl', function() {

      QUnit.test('Object.keys', function(assert) {
        assert.deepEqual(Object.keys(matrix_impl).sort(), [
          "Matrix",
          "MatrixBase",
          "create"
        ]);
      });

    });

  }
});
