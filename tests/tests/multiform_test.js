define(["require", "exports", 'multiform'], function (require, exports, multiform) {
  exports.test = function(){

    QUnit.module('multiform', function() {

      QUnit.test('Object.keys', function(assert) {
        assert.deepEqual(Object.keys(multiform).sort(), [
          "MultiForm",
          "MultiFormGrid",
          "addIconVisChooser",
          "addSelectVisChooser",
          "create",
          "createGrid",
          "toAvailableVisses"
        ]);
      });

      /* TODO: Add at least one test for multiform.MultiForm
      QUnit.module('MultiForm', function() {
        QUnit.test('???', function(assert) {
          assert.equal(multiform.MultiForm(), '???');
        });
      })
      */

      /* TODO: Add at least one test for multiform.MultiFormGrid
      QUnit.module('MultiFormGrid', function() {
        QUnit.test('???', function(assert) {
          assert.equal(multiform.MultiFormGrid(), '???');
        });
      })
      */

      /* TODO: Add at least one test for multiform.addIconVisChooser
      QUnit.module('addIconVisChooser', function() {
        QUnit.test('???', function(assert) {
          assert.equal(multiform.addIconVisChooser(), '???');
        });
      })
      */

      /* TODO: Add at least one test for multiform.addSelectVisChooser
      QUnit.module('addSelectVisChooser', function() {
        QUnit.test('???', function(assert) {
          assert.equal(multiform.addSelectVisChooser(), '???');
        });
      })
      */

      /* TODO: Add at least one test for multiform.create
      QUnit.module('create', function() {
        QUnit.test('???', function(assert) {
          assert.equal(multiform.create(), '???');
        });
      })
      */

      /* TODO: Add at least one test for multiform.createGrid
      QUnit.module('createGrid', function() {
        QUnit.test('???', function(assert) {
          assert.equal(multiform.createGrid(), '???');
        });
      })
      */

      /* TODO: Add at least one test for multiform.toAvailableVisses
      QUnit.module('toAvailableVisses', function() {
        QUnit.test('???', function(assert) {
          assert.equal(multiform.toAvailableVisses(), '???');
        });
      })
      */



    });

  }
});
