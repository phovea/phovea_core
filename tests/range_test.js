QUnit.module('range');
QUnit.test('range test', function(assert) {
  assert.equal(parseRange('1:2:3').toString(), '(1:2:3)');
});