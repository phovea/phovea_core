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

      /* TODO: Add at least one test for session.has
      QUnit.module('has', function() {
        QUnit.test('???', function(assert) {
          assert.equal(session.has(), '???');
        });
      })
      */

      /* TODO: Add at least one test for session.remove
      QUnit.module('remove', function() {
        QUnit.test('???', function(assert) {
          assert.equal(session.remove(), '???');
        });
      })
      */

      /* TODO: Add at least one test for session.retrieve
      QUnit.module('retrieve', function() {
        QUnit.test('???', function(assert) {
          assert.equal(session.retrieve(), '???');
        });
      })
      */

      /* TODO: Add at least one test for session.store
      QUnit.module('store', function() {
        QUnit.test('???', function(assert) {
          assert.equal(session.store(), '???');
        });
      })
      */

    });

  }
});
