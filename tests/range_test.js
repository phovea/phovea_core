define(["require", "exports", 'range'], function (require, exports, range) {
  exports.test = function(){
    QUnit.module('range');
    QUnit.test('range test', function(assert) {
      assert.equal(range.parse('1:2:3').toString(), '(1:2:3)');
    });
  }
});

