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

    });

  }
});
