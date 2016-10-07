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

    });

  }
});
