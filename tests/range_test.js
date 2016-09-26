define(["require", "exports", 'range'], function (require, exports, range) {
  exports.test = function(){
    QUnit.module('range');

    function assert_parse(name, input, output) {
      QUnit.test(name, function(assert) {
        assert.equal(range.parse(input).toString(), output);
      });
    }

    assert_parse('start', '1', '1');
    assert_parse('start + end', '1:2', '1'); // TODO: BUG!
    assert_parse('start + end + step', '1:2:3', '(1:2:3)');

    assert_parse('negative start < -2', '-2:-1', '(-2)'); // TODO: BUG!
    assert_parse('negative end', '1:-1', '(1:-1)');
    assert_parse('negative end < -1', '1:-2', '(1:-2)');
    assert_parse('negative end with step', '0:-1:2', '(0:-1:2)');
    assert_parse('negative step < -1', '1:2:-2', '(1:2:-2)');

    assert_parse('set as second dimension', '1, (1,4)', '1,NaN,4'); // TODO: BUG!
    assert_parse('", ("', '(1:3), (1:3)', '(1:3),(NaN:3)'); // TODO: BUG!

    assert_parse('syntax error', ':::::', '(NaN:NaN:NaN)'); // TODO: BUG! (Should throw error.)
  }
});

