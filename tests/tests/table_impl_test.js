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

      // TODO: Should the constructors even be accessible, or should we go through create?

      // TODO: C.registry is undefined
      // QUnit.module('Table', function() {
      //   QUnit.test('properties', function(assert) {
      //     assert.deepEqual(properties(new table_impl.Table({idtype: 'fake'}, 'loader')), []);
      //   });
      // });

      QUnit.module('TableBase', function() {
        QUnit.test('properties', function(assert) {
          assert.deepEqual(properties(new table_impl.TableBase()), [
            "_root",
            "accumulateEvents",
            "clear",
            "constructor",
            "dim",
            "fillAndSend",
            "fire",
            "fireEvent",
            "fromIdRange",
            "handlers",
            "idView",
            "ids",
            "idtypes",
            "list",
            "ncol",
            "nrow",
            "numSelectListeners",
            "off",
            "on",
            "propagate",
            "queryView",
            "reduce",
            "restore",
            "select",
            "selectImpl",
            "selectionCache",
            "selectionListener",
            "selectionListeners",
            "selections",
            "singleSelectionListener",
            "size",
            "view"
          ]);
        });
      });

      QUnit.module('TableVector', function() {
        QUnit.test('properties', function(assert) {
          assert.deepEqual(properties(new table_impl.TableVector({desc: {fqname: 'stub'}}, 'impl', {})), [
            "_root",
            "accumulateEvents",
            "at",
            "clear",
            "column",
            "constructor",
            "data",
            "desc",
            "dim",
            "every",
            "fillAndSend",
            "filter",
            "fire",
            "fireEvent",
            "forEach",
            "fromIdRange",
            "groups",
            "handlers",
            "hist",
            "idView",
            "ids",
            "idtype",
            "idtypes",
            "index",
            "indices",
            "length",
            "list",
            "map",
            "names",
            "numSelectListeners",
            "off",
            "on",
            "persist",
            "propagate",
            "reduce",
            "reduceRight",
            "restore",
            "select",
            "selectImpl",
            "selectionCache",
            "selectionListener",
            "selectionListeners",
            "selections",
            "singleSelectionListener",
            "size",
            "some",
            "sort",
            "stats",
            "stratification",
            "table",
            "valuetype",
            "view"
          ]);
        });
      });

      QUnit.module('VectorTable', function() {
        QUnit.test('properties', function(assert) {
          assert.deepEqual(properties(new table_impl.VectorTable({}, [{desc: 'foo', length: 'bar'}])), [
            "_root",
            "accumulateEvents",
            "at",
            "clear",
            "col",
            "cols",
            "constructor",
            "data",
            "desc",
            "dim",
            "fillAndSend",
            "fire",
            "fireEvent",
            "fromIdRange",
            "handlers",
            "idView",
            "ids",
            "idtypes",
            "list",
            "ncol",
            "nrow",
            "numSelectListeners",
            "objects",
            "off",
            "on",
            "persist",
            "propagate",
            "queryView",
            "reduce",
            "restore",
            "rowIds",
            "rows",
            "rowtype",
            "select",
            "selectImpl",
            "selectionCache",
            "selectionListener",
            "selectionListeners",
            "selections",
            "singleSelectionListener",
            "size",
            "vectors",
            "view"
          ]);
        });
      });

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
