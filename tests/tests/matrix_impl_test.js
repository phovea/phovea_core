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

      /* TODO: Add at least one test for matrix_impl.Matrix
      QUnit.module('Matrix', function() {
        QUnit.test('???', function(assert) {
          assert.equal(matrix_impl.Matrix(), '???');
        });
      })
      */

      /* TODO: Add at least one test for matrix_impl.MatrixBase
      QUnit.module('MatrixBase', function() {
        QUnit.test('???', function(assert) {
          assert.equal(matrix_impl.MatrixBase(), '???');
        });
      })
      */

      /* TODO: Add at least one test for matrix_impl.create
      QUnit.module('create', function() {
        QUnit.test('???', function(assert) {
          assert.equal(matrix_impl.create(), '???');
        });
      })
      */



    });

  }
});
