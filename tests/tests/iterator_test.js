define(["require", "exports", 'iterator'], function (require, exports, iterator) {
  exports.test = function(){

    QUnit.module('iterator', function() {

      QUnit.test('Object.keys', function(assert) {
        assert.deepEqual(Object.keys(iterator).sort(), [
          "AIterator",
          "ConcatIterator",
          "EmptyIterator",
          "Iterator",
          "ListIterator",
          "SingleIterator",
          "concat",
          "empty",
          "forList",
          "range",
          "single"
        ]);
      });

    });

  }
});

