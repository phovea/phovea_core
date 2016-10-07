define(["require", "exports", 'range'], function (require, exports, range) {
  exports.test = function(){

    QUnit.module('range', function() {

      QUnit.test('Object.keys', function(assert) {
        assert.deepEqual(Object.keys(range).sort(), [
          "CompositeRange1D",
          "Range",
          "Range1D",
          "Range1DGroup",
          "RangeElem",
          "SingleRangeElem",
          "all",
          "asUngrouped",
          "cell",
          "composite",
          "is",
          "join",
          "list",
          "none",
          "parse",
          "range"
        ]);
      });

      /* TODO: Add at least one test for range.CompositeRange1D
      QUnit.module('CompositeRange1D', function() {
        QUnit.test('???', function(assert) {
          assert.equal(range.CompositeRange1D(), '???');
        });
      })
      */

      /* TODO: Add at least one test for range.Range
      QUnit.module('Range', function() {
        QUnit.test('???', function(assert) {
          assert.equal(range.Range(), '???');
        });
      })
      */

      /* TODO: Add at least one test for range.Range1D
      QUnit.module('Range1D', function() {
        QUnit.test('???', function(assert) {
          assert.equal(range.Range1D(), '???');
        });
      })
      */

      /* TODO: Add at least one test for range.Range1DGroup
      QUnit.module('Range1DGroup', function() {
        QUnit.test('???', function(assert) {
          assert.equal(range.Range1DGroup(), '???');
        });
      })
      */

      /* TODO: Add at least one test for range.RangeElem
      QUnit.module('RangeElem', function() {
        QUnit.test('???', function(assert) {
          assert.equal(range.RangeElem(), '???');
        });
      })
      */

      /* TODO: Add at least one test for range.SingleRangeElem
      QUnit.module('SingleRangeElem', function() {
        QUnit.test('???', function(assert) {
          assert.equal(range.SingleRangeElem(), '???');
        });
      })
      */

      /* TODO: Add at least one test for range.all
      QUnit.module('all', function() {
        QUnit.test('???', function(assert) {
          assert.equal(range.all(), '???');
        });
      })
      */

      /* TODO: Add at least one test for range.asUngrouped
      QUnit.module('asUngrouped', function() {
        QUnit.test('???', function(assert) {
          assert.equal(range.asUngrouped(), '???');
        });
      })
      */

      /* TODO: Add at least one test for range.cell
      QUnit.module('cell', function() {
        QUnit.test('???', function(assert) {
          assert.equal(range.cell(), '???');
        });
      })
      */

      /* TODO: Add at least one test for range.composite
      QUnit.module('composite', function() {
        QUnit.test('???', function(assert) {
          assert.equal(range.composite(), '???');
        });
      })
      */

      /* TODO: Add at least one test for range.is
      QUnit.module('is', function() {
        QUnit.test('???', function(assert) {
          assert.equal(range.is(), '???');
        });
      })
      */

      /* TODO: Add at least one test for range.join
      QUnit.module('join', function() {
        QUnit.test('???', function(assert) {
          assert.equal(range.join(), '???');
        });
      })
      */

      /* TODO: Add at least one test for range.list
      QUnit.module('list', function() {
        QUnit.test('???', function(assert) {
          assert.equal(range.list(), '???');
        });
      })
      */

      /* TODO: Add at least one test for range.none
      QUnit.module('none', function() {
        QUnit.test('???', function(assert) {
          assert.equal(range.none(), '???');
        });
      })
      */

      QUnit.module('parse', function() {

        function assert_parse(name, input, output) {
          QUnit.test(name, function(assert) {
            assert.equal(range.parse(input).toString(), output);
          });
        }

        assert_parse('start', '1', '1');
        assert_parse('start + end (single)', '1:2', '1'); // OK: end index is excluded
        assert_parse('start + end (multiple)', '1:10', '(1:10)');
        assert_parse('start + end + step', '1:2:3', '(1:2:3)');

        assert_parse('negative start (single)', '-2:-1', '(-2)'); // OK: end index is excluded
        assert_parse('negative start (multiple)', '-3:-1', '(-3:-1)');
        assert_parse('negative end', '1:-1', '(1:-1)');
        assert_parse('negative end < -1', '1:-2', '(1:-2)');
        assert_parse('negative end with step', '0:-1:2', '(0:-1:2)');
        assert_parse('negative step < -1', '1:2:-2', '(1:2:-2)');

        assert_parse('comma space set', '1, (1,4)', '1,(1,4)');
        assert_parse('comma tab set', '1,\t(1,4)', '1,(1,4)');
        assert_parse('comma space range', '(1:3), (1:3)', '(1:3),(1:3)');

        assert_parse('syntax error', ':::::', '(NaN:NaN:NaN)'); // TODO: BUG! (Should throw error.)

      })

      /* TODO: Add at least one test for range.range
      QUnit.module('range', function() {
        QUnit.test('???', function(assert) {
          assert.equal(range.range(), '???');
        });
      })
      */


    });

  }
});

