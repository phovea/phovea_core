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

      /* TODO: Add at least one test for datatype.DataTypeBase
      QUnit.module('DataTypeBase', function() {
        QUnit.test('???', function(assert) {
          assert.equal(datatype.DataTypeBase(), '???');
        });
      })
      */

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

