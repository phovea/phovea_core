define(["require", "exports", 'matrix'], function (require, exports, matrix) {
  exports.test = function(){

    QUnit.module('matrix', function() {

      QUnit.test('Object.keys', function(assert) {
        assert.deepEqual(Object.keys(matrix).sort(), [
          "IDTYPE_CELL",
          "IDTYPE_COLUMN",
          "IDTYPE_ROW"
        ]);
      });

      /* TODO: Add at least one test for matrix.IDTYPE_CELL
      QUnit.module('IDTYPE_CELL', function() {
        QUnit.test('???', function(assert) {
          assert.equal(matrix.IDTYPE_CELL(), '???');
        });
      })
      */

      /* TODO: Add at least one test for matrix.IDTYPE_COLUMN
      QUnit.module('IDTYPE_COLUMN', function() {
        QUnit.test('???', function(assert) {
          assert.equal(matrix.IDTYPE_COLUMN(), '???');
        });
      })
      */

      /* TODO: Add at least one test for matrix.IDTYPE_ROW
      QUnit.module('IDTYPE_ROW', function() {
        QUnit.test('???', function(assert) {
          assert.equal(matrix.IDTYPE_ROW(), '???');
        });
      })
      */


    });

  }
});
