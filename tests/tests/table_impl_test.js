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

      /* TODO: Add at least one test for table_impl.Table
      QUnit.module('Table', function() {
        QUnit.test('???', function(assert) {
          assert.equal(table_impl.Table(), '???');
        });
      })
      */

      /* TODO: Add at least one test for table_impl.TableBase
      QUnit.module('TableBase', function() {
        QUnit.test('???', function(assert) {
          assert.equal(table_impl.TableBase(), '???');
        });
      })
      */

      /* TODO: Add at least one test for table_impl.TableVector
      QUnit.module('TableVector', function() {
        QUnit.test('???', function(assert) {
          assert.equal(table_impl.TableVector(), '???');
        });
      })
      */

      /* TODO: Add at least one test for table_impl.VectorTable
      QUnit.module('VectorTable', function() {
        QUnit.test('???', function(assert) {
          assert.equal(table_impl.VectorTable(), '???');
        });
      })
      */

      /* TODO: Add at least one test for table_impl.create
      QUnit.module('create', function() {
        QUnit.test('???', function(assert) {
          assert.equal(table_impl.create(), '???');
        });
      })
      */

      /* TODO: Add at least one test for table_impl.fromVectors
      QUnit.module('fromVectors', function() {
        QUnit.test('???', function(assert) {
          assert.equal(table_impl.fromVectors(), '???');
        });
      })
      */

      /* TODO: Add at least one test for table_impl.wrapObjects
      QUnit.module('wrapObjects', function() {
        QUnit.test('???', function(assert) {
          assert.equal(table_impl.wrapObjects(), '???');
        });
      })
      */


    });

  }
});
