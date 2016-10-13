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

      /* TODO: Add at least one test for iterator.AIterator
      QUnit.module('AIterator', function() {
        QUnit.test('???', function(assert) {
          assert.equal(iterator.AIterator(), '???');
        });
      })
      */

      /* TODO: Add at least one test for iterator.ConcatIterator
      QUnit.module('ConcatIterator', function() {
        QUnit.test('???', function(assert) {
          assert.equal(iterator.ConcatIterator(), '???');
        });
      })
      */

      /* TODO: Add at least one test for iterator.EmptyIterator
      QUnit.module('EmptyIterator', function() {
        QUnit.test('???', function(assert) {
          assert.equal(iterator.EmptyIterator(), '???');
        });
      })
      */

      /* TODO: Add at least one test for iterator.Iterator
      QUnit.module('Iterator', function() {
        QUnit.test('???', function(assert) {
          assert.equal(iterator.Iterator(), '???');
        });
      })
      */

      /* TODO: Add at least one test for iterator.ListIterator
      QUnit.module('ListIterator', function() {
        QUnit.test('???', function(assert) {
          assert.equal(iterator.ListIterator(), '???');
        });
      })
      */

      /* TODO: Add at least one test for iterator.SingleIterator
      QUnit.module('SingleIterator', function() {
        QUnit.test('???', function(assert) {
          assert.equal(iterator.SingleIterator(), '???');
        });
      })
      */

      /* TODO: Add at least one test for iterator.concat
      QUnit.module('concat', function() {
        QUnit.test('???', function(assert) {
          assert.equal(iterator.concat(), '???');
        });
      })
      */

      /* TODO: Add at least one test for iterator.empty
      QUnit.module('empty', function() {
        QUnit.test('???', function(assert) {
          assert.equal(iterator.empty(), '???');
        });
      })
      */

      /* TODO: Add at least one test for iterator.forList
      QUnit.module('forList', function() {
        QUnit.test('???', function(assert) {
          assert.equal(iterator.forList(), '???');
        });
      })
      */

      /* TODO: Add at least one test for iterator.range
      QUnit.module('range', function() {
        QUnit.test('???', function(assert) {
          assert.equal(iterator.range(), '???');
        });
      })
      */

      /* TODO: Add at least one test for iterator.single
      QUnit.module('single', function() {
        QUnit.test('???', function(assert) {
          assert.equal(iterator.single(), '???');
        });
      })
      */

    });

  }
});

