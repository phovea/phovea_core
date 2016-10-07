define(["require", "exports", 'table_impl'], function (require, exports, table_impl) {
  exports.test = function(){

    QUnit.module('table_impl', function() {

      QUnit.test('Object.keys', function(assert) {
        assert.deepEqual(Object.keys(table_impl).sort(), [
          "Table",
          "TableBase",
          "TableVector",
          "VectorTable",
          "create",
          "fromVectors",
          "wrapObjects"
        ]);
      });

    });

  }
});
