define(["require", "exports", 'event'], function (require, exports, event) {
  exports.test = function(){

    QUnit.module('event', function() {

      QUnit.test('Object.keys', function(assert) {
        assert.deepEqual(Object.keys(event).sort(), [
          "EventHandler",
          "fire",
          "list",
          "off",
          "on"
        ]);
      });

      /* TODO: Add at least one test for event.EventHandler
      QUnit.module('EventHandler', function() {
        QUnit.test('???', function(assert) {
          assert.equal(event.EventHandler(), '???');
        });
      })
      */

      /* TODO: Add at least one test for event.fire
      QUnit.module('fire', function() {
        QUnit.test('???', function(assert) {
          assert.equal(event.fire(), '???');
        });
      })
      */

      /* TODO: Add at least one test for event.list
      QUnit.module('list', function() {
        QUnit.test('???', function(assert) {
          assert.equal(event.list(), '???');
        });
      })
      */

      /* TODO: Add at least one test for event.off
      QUnit.module('off', function() {
        QUnit.test('???', function(assert) {
          assert.equal(event.off(), '???');
        });
      })
      */

      /* TODO: Add at least one test for event.on
      QUnit.module('on', function() {
        QUnit.test('???', function(assert) {
          assert.equal(event.on(), '???');
        });
      })
      */

    });

  }
});

