define(["require", "exports", 'range'], function (require, exports, range) {
  exports.test = function(){
    QUnit.module('range');

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
  }
});

