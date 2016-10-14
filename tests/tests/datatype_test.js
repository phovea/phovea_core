define(["require", "exports", 'datatype'], function (require, exports, datatype) {
  exports.test = function(){

    QUnit.module('datatype', function() {

      QUnit.test('Object.keys', function(assert) {
        assert.deepEqual(Object.keys(datatype).sort(), [
          "DataTypeBase",
          "assignData",
          "categorical2partitioning",
          "defineDataType",
          "isDataType",
          "mask",
          "transpose"
        ]);
      });

      QUnit.module('DataTypeBase', function() {
        QUnit.test('properties', function(assert) {
          var data_description = {};
          assert.deepEqual(properties(new datatype.DataTypeBase(data_description)), [
            "accumulateEvents",
            "clear",
            "constructor",
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
            "numSelectListeners",
            "off",
            "on",
            "persist",
            "propagate",
            "restore",
            "select",
            "selectImpl",
            "selectionCache",
            "selectionListener",
            "selectionListeners",
            "selections",
            "singleSelectionListener",
            "toString"
          ]);
        });

        /* TODO: Add at least one test for datatype.accumulateEvents
        QUnit.module('accumulateEvents', function() {
          QUnit.test('???', function(assert) {
            assert.equal(datatype.accumulateEvents(), '???');
          });
        });
        */

        /* TODO: Add at least one test for datatype.clear
        QUnit.module('clear', function() {
          QUnit.test('???', function(assert) {
            assert.equal(datatype.clear(), '???');
          });
        });
        */

        /* TODO: Add at least one test for datatype.constructor
        QUnit.module('constructor', function() {
          QUnit.test('???', function(assert) {
            assert.equal(datatype.constructor(), '???');
          });
        });
        */

        /* TODO: Add at least one test for datatype.desc
        QUnit.module('desc', function() {
          QUnit.test('???', function(assert) {
            assert.equal(datatype.desc(), '???');
          });
        });
        */

        /* TODO: Add at least one test for datatype.dim
        QUnit.module('dim', function() {
          QUnit.test('???', function(assert) {
            assert.equal(datatype.dim(), '???');
          });
        });
        */

        /* TODO: Add at least one test for datatype.fillAndSend
        QUnit.module('fillAndSend', function() {
          QUnit.test('???', function(assert) {
            assert.equal(datatype.fillAndSend(), '???');
          });
        });
        */

        /* TODO: Add at least one test for datatype.fire
        QUnit.module('fire', function() {
          QUnit.test('???', function(assert) {
            assert.equal(datatype.fire(), '???');
          });
        });
        */

        /* TODO: Add at least one test for datatype.fireEvent
        QUnit.module('fireEvent', function() {
          QUnit.test('???', function(assert) {
            assert.equal(datatype.fireEvent(), '???');
          });
        });
        */

        /* TODO: Add at least one test for datatype.fromIdRange
        QUnit.module('fromIdRange', function() {
          QUnit.test('???', function(assert) {
            assert.equal(datatype.fromIdRange(), '???');
          });
        });
        */

        /* TODO: Add at least one test for datatype.handlers
        QUnit.module('handlers', function() {
          QUnit.test('???', function(assert) {
            assert.equal(datatype.handlers(), '???');
          });
        });
        */

        /* TODO: Add at least one test for datatype.idView
        QUnit.module('idView', function() {
          QUnit.test('???', function(assert) {
            assert.equal(datatype.idView(), '???');
          });
        });
        */

        /* TODO: Add at least one test for datatype.ids
        QUnit.module('ids', function() {
          QUnit.test('???', function(assert) {
            assert.equal(datatype.ids(), '???');
          });
        });
        */

        /* TODO: Add at least one test for datatype.idtypes
        QUnit.module('idtypes', function() {
          QUnit.test('???', function(assert) {
            assert.equal(datatype.idtypes(), '???');
          });
        });
        */

        /* TODO: Add at least one test for datatype.list
        QUnit.module('list', function() {
          QUnit.test('???', function(assert) {
            assert.equal(datatype.list(), '???');
          });
        });
        */

        /* TODO: Add at least one test for datatype.numSelectListeners
        QUnit.module('numSelectListeners', function() {
          QUnit.test('???', function(assert) {
            assert.equal(datatype.numSelectListeners(), '???');
          });
        });
        */

        /* TODO: Add at least one test for datatype.off
        QUnit.module('off', function() {
          QUnit.test('???', function(assert) {
            assert.equal(datatype.off(), '???');
          });
        });
        */

        /* TODO: Add at least one test for datatype.on
        QUnit.module('on', function() {
          QUnit.test('???', function(assert) {
            assert.equal(datatype.on(), '???');
          });
        });
        */

        /* TODO: Add at least one test for datatype.persist
        QUnit.module('persist', function() {
          QUnit.test('???', function(assert) {
            assert.equal(datatype.persist(), '???');
          });
        });
        */

        /* TODO: Add at least one test for datatype.propagate
        QUnit.module('propagate', function() {
          QUnit.test('???', function(assert) {
            assert.equal(datatype.propagate(), '???');
          });
        });
        */

        /* TODO: Add at least one test for datatype.restore
        QUnit.module('restore', function() {
          QUnit.test('???', function(assert) {
            assert.equal(datatype.restore(), '???');
          });
        });
        */

        /* TODO: Add at least one test for datatype.select
        QUnit.module('select', function() {
          QUnit.test('???', function(assert) {
            assert.equal(datatype.select(), '???');
          });
        });
        */

        /* TODO: Add at least one test for datatype.selectImpl
        QUnit.module('selectImpl', function() {
          QUnit.test('???', function(assert) {
            assert.equal(datatype.selectImpl(), '???');
          });
        });
        */

        /* TODO: Add at least one test for datatype.selectionCache
        QUnit.module('selectionCache', function() {
          QUnit.test('???', function(assert) {
            assert.equal(datatype.selectionCache(), '???');
          });
        });
        */

        /* TODO: Add at least one test for datatype.selectionListener
        QUnit.module('selectionListener', function() {
          QUnit.test('???', function(assert) {
            assert.equal(datatype.selectionListener(), '???');
          });
        });
        */

        /* TODO: Add at least one test for datatype.selectionListeners
        QUnit.module('selectionListeners', function() {
          QUnit.test('???', function(assert) {
            assert.equal(datatype.selectionListeners(), '???');
          });
        });
        */

        /* TODO: Add at least one test for datatype.selections
        QUnit.module('selections', function() {
          QUnit.test('???', function(assert) {
            assert.equal(datatype.selections(), '???');
          });
        });
        */

        /* TODO: Add at least one test for datatype.singleSelectionListener
        QUnit.module('singleSelectionListener', function() {
          QUnit.test('???', function(assert) {
            assert.equal(datatype.singleSelectionListener(), '???');
          });
        });
        */

        /* TODO: Add at least one test for datatype.toString
        QUnit.module('toString', function() {
          QUnit.test('???', function(assert) {
            assert.equal(datatype.toString(), '???');
          });
        });
        */
      });

      /* TODO: Add at least one test for datatype.assignData
      QUnit.module('assignData', function() {
        QUnit.test('???', function(assert) {
          assert.equal(datatype.assignData(), '???');
        });
      })
      */

      /* TODO: Add at least one test for datatype.categorical2partitioning
      QUnit.module('categorical2partitioning', function() {
        QUnit.test('???', function(assert) {
          assert.equal(datatype.categorical2partitioning(), '???');
        });
      })
      */

      /* TODO: Add at least one test for datatype.defineDataType
      QUnit.module('defineDataType', function() {
        QUnit.test('???', function(assert) {
          assert.equal(datatype.defineDataType(), '???');
        });
      })
      */

      /* TODO: Add at least one test for datatype.isDataType
      QUnit.module('isDataType', function() {
        QUnit.test('???', function(assert) {
          assert.equal(datatype.isDataType(), '???');
        });
      })
      */

      /* TODO: Add at least one test for datatype.mask
      QUnit.module('mask', function() {
        QUnit.test('???', function(assert) {
          assert.equal(datatype.mask(), '???');
        });
      })
      */

      /* TODO: Add at least one test for datatype.transpose
      QUnit.module('transpose', function() {
        QUnit.test('???', function(assert) {
          assert.equal(datatype.transpose(), '???');
        });
      })
      */

    });

  }
});

