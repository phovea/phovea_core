define(["require", "exports", 'session'], function (require, exports, session) {
  exports.test = function(){

    QUnit.module('session', function() {

      QUnit.test('Object.keys', function(assert) {
        assert.deepEqual(Object.keys(session).sort(), [
          "has",
          "remove",
          "retrieve",
          "store"
        ]);
      });

      QUnit.test('methods', function(assert) {
        var key = 'test-key';
        assert.equal(session.has(key), false);
        session.store(key, 'foobar');
        assert.equal(session.has(key), true);
        assert.equal(session.retrieve(key), 'foobar');
        session.remove(key);
        assert.equal(session.has(key), false);
      });

    });

  }
});
