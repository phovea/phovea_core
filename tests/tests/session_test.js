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

        session.store(key, 'barfoo');
        assert.equal(session.has(key), true);
        assert.equal(session.retrieve(key), 'barfoo');

        session.remove(key);
        assert.equal(session.has(key), false);
      });

      QUnit.module('datatypes', function(assert) {
        function assert_store(data) {
          QUnit.test(typeof data, function(assert) {
            var key = 'key';
            session.store(key, data);
            assert.deepEqual(session.retrieve(key), data);
          });
        }
        assert_store(1);
        assert_store(['array']);
        assert_store({'hash': true});
      });

    });

  }
});
