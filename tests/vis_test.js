define(["require", "exports", 'vis'], function (require, exports, vis) {
  exports.test = function(){

    QUnit.module('vis.AVisInstance', function() {

      QUnit.test('fields', function(assert) {
        assert.deepEqual(Object.keys(new vis.AVisInstance()), [
          "handlers",
          "id",
          "_built"
        ]);
      });

      // TODO: Test methods

    });


    QUnit.module('vis.assignVis', function() {

      QUnit.test('no arg', function(assert) {
        assert.throws( // TODO
          function() {
            vis.assignVis();
          },
          TypeError
        );
      });

      QUnit.test('one arg', function(assert) {
        assert.throws( // TODO
          function() {
            vis.assignVis('node');
          },
          TypeError
        );
      });

      QUnit.test('two arg', function(assert) {
        assert.throws( // TODO
          function() {
            vis.assignVis('node', 'vis');
          },
          TypeError
        );
      });

    });



    QUnit.module('vis.list', function() {

      QUnit.test('no arg', function(assert) {
        assert.throws( // TODO
          function() {
            vis.list();
          },
          TypeError
        );
      });

      QUnit.test('one arg', function(assert) {
        assert.throws( // TODO
          function() {
            vis.list('TODO: datatypes.IDataType');
          },
          TypeError
        );
      });

    });

  }
});

