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

      /* TODO: Add at least one test for vector_impl.StratificationVector
      QUnit.module('StratificationVector', function() {
        QUnit.test('???', function(assert) {
          assert.equal(vector_impl.StratificationVector(), '???');
        });
      })
      */

      /* TODO: Add at least one test for vector_impl.Vector
      QUnit.module('Vector', function() {
        QUnit.test('???', function(assert) {
          assert.equal(vector_impl.Vector(), '???');
        });
      })
      */

      /* TODO: Add at least one test for vector_impl.VectorBase
      QUnit.module('VectorBase', function() {
        QUnit.test('???', function(assert) {
          assert.equal(vector_impl.VectorBase(), '???');
        });
      })
      */

      /* TODO: Add at least one test for vector_impl.create
      QUnit.module('create', function() {
        QUnit.test('???', function(assert) {
          assert.equal(vector_impl.create(), '???');
        });
      })
      */

      /* TODO: Add at least one test for vector_impl.wrap
      QUnit.module('wrap', function() {
        QUnit.test('???', function(assert) {
          assert.equal(vector_impl.wrap(), '???');
        });
      })
      */



    });

  }
});
