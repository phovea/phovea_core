name = ARGV[0]
puts(
<<END
define(["require", "exports", '#{name}'], function (require, exports, #{name}) {
  exports.test = function(){

    QUnit.module('#{name}', function() {

      QUnit.test('Object.keys', function(assert) {
        assert.deepEqual(Object.keys(#{name}).sort(), [
          // TODO
        ]);
      });

    });

  }
});
END
)
