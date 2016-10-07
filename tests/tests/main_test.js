define(["require", "exports", 'main'], function (require, exports, main) {
  exports.test = function(){

    QUnit.module('main', function() {

      QUnit.test('Object.keys', function(assert) {
        assert.deepEqual(Object.keys(main).sort(), [
          "IdPool",
          "_init",
          "argFilter",
          "argList",
          "argSort",
          "bind",
          "bounds",
          "callable",
          "constant",
          "constantFalse",
          "constantTrue",
          "copyDnD",
          "delayedCall",
          "extendClass",
          "fix_id",
          "flagId",
          "getter",
          "hasDnDType",
          "hash",
          "identity",
          "indexOf",
          "isFunction",
          "isUndefined",
          "mixin",
          "mod",
          "noop",
          "offline",
          "offset",
          "onDOMNodeRemoved",
          "param",
          "random_id",
          "resolveIn",
          "search",
          "server_json_suffix",
          "server_url",
          "uniqueId",
          "uniqueString",
          "updateDropEffect",
          "version"
        ]);
      });

      /* TODO: Add at least one test for main.IdPool
      QUnit.module('IdPool', function() {
        QUnit.test('???', function(assert) {
          assert.equal(main.IdPool(), '???');
        });
      })
      */

      /* TODO: Add at least one test for main._init
      QUnit.module('_init', function() {
        QUnit.test('???', function(assert) {
          assert.equal(main._init(), '???');
        });
      })
      */

      /* TODO: Add at least one test for main.argFilter
      QUnit.module('argFilter', function() {
        QUnit.test('???', function(assert) {
          assert.equal(main.argFilter(), '???');
        });
      })
      */

      /* TODO: Add at least one test for main.argList
      QUnit.module('argList', function() {
        QUnit.test('???', function(assert) {
          assert.equal(main.argList(), '???');
        });
      })
      */

      /* TODO: Add at least one test for main.argSort
      QUnit.module('argSort', function() {
        QUnit.test('???', function(assert) {
          assert.equal(main.argSort(), '???');
        });
      })
      */

      /* TODO: Add at least one test for main.bind
      QUnit.module('bind', function() {
        QUnit.test('???', function(assert) {
          assert.equal(main.bind(), '???');
        });
      })
      */

      /* TODO: Add at least one test for main.bounds
      QUnit.module('bounds', function() {
        QUnit.test('???', function(assert) {
          assert.equal(main.bounds(), '???');
        });
      })
      */

      /* TODO: Add at least one test for main.callable
      QUnit.module('callable', function() {
        QUnit.test('???', function(assert) {
          assert.equal(main.callable(), '???');
        });
      })
      */

      QUnit.module('constant', function() {
        function assert_constant(c) {
          QUnit.test(typeof c + ':' + c, function(assert) {
            assert.equal(main.constant(c)(), c);
          });
        }

        assert_constant(null);
        assert_constant(false);
        assert_constant(true);
        assert_constant('string');
        assert_constant(42);
        assert_constant({'hash': true});
        assert_constant(['array']);
        assert_constant(function(){return 'foo'});
      });

      QUnit.module('constantFalse', function() {
        QUnit.test('false', function(assert) {
          assert.equal(main.constantFalse(), false);
        });
      });

      QUnit.module('constantTrue', function() {
        QUnit.test('true', function(assert) {
          assert.equal(main.constantTrue(), true);
        });
      });

      /* TODO: Add at least one test for main.copyDnD
      QUnit.module('copyDnD', function() {
        QUnit.test('???', function(assert) {
          assert.equal(main.copyDnD(), '???');
        });
      })
      */

      /* TODO: Add at least one test for main.delayedCall
      QUnit.module('delayedCall', function() {
        QUnit.test('???', function(assert) {
          assert.equal(main.delayedCall(), '???');
        });
      })
      */

      /* TODO: Add at least one test for main.extendClass
      QUnit.module('extendClass', function() {
        QUnit.test('???', function(assert) {
          assert.equal(main.extendClass(), '???');
        });
      })
      */

      /* TODO: Add at least one test for main.fix_id
      QUnit.module('fix_id', function() {
        QUnit.test('???', function(assert) {
          assert.equal(main.fix_id(), '???');
        });
      })
      */

      /* TODO: Add at least one test for main.flagId
      QUnit.module('flagId', function() {
        QUnit.test('???', function(assert) {
          assert.equal(main.flagId(), '???');
        });
      })
      */

      /* TODO: Add at least one test for main.getter
      QUnit.module('getter', function() {
        QUnit.test('???', function(assert) {
          assert.equal(main.getter(), '???');
        });
      })
      */

      /* TODO: Add at least one test for main.hasDnDType
      QUnit.module('hasDnDType', function() {
        QUnit.test('???', function(assert) {
          assert.equal(main.hasDnDType(), '???');
        });
      })
      */

      /* TODO: Add at least one test for main.hash
      QUnit.module('hash', function() {
        QUnit.test('???', function(assert) {
          assert.equal(main.hash(), '???');
        });
      })
      */

      /* TODO: Add at least one test for main.identity
      QUnit.module('identity', function() {
        QUnit.test('???', function(assert) {
          assert.equal(main.identity(), '???');
        });
      })
      */

      /* TODO: Add at least one test for main.indexOf
      QUnit.module('indexOf', function() {
        QUnit.test('???', function(assert) {
          assert.equal(main.indexOf(), '???');
        });
      })
      */

      /* TODO: Add at least one test for main.isFunction
      QUnit.module('isFunction', function() {
        QUnit.test('???', function(assert) {
          assert.equal(main.isFunction(), '???');
        });
      })
      */

      /* TODO: Add at least one test for main.isUndefined
      QUnit.module('isUndefined', function() {
        QUnit.test('???', function(assert) {
          assert.equal(main.isUndefined(), '???');
        });
      })
      */

      /* TODO: Add at least one test for main.mixin
      QUnit.module('mixin', function() {
        QUnit.test('???', function(assert) {
          assert.equal(main.mixin(), '???');
        });
      })
      */

      QUnit.module('mod', function() {
        QUnit.test('+ % +', function(assert) {
          assert.equal(main.mod(101, 5), 1);
        });
        QUnit.test('- % + (native)', function(assert) {
          assert.equal(-101 % 5, -1);
        });
        QUnit.test('- % +', function(assert) {
          assert.equal(main.mod(-101, 5), 4);
        });
        QUnit.test('+ % -', function(assert) {
          assert.equal(main.mod(101, -5), -4);
        });
        QUnit.test('- % -', function(assert) {
          assert.equal(main.mod(-101, -5), -1);
        });
      });

      QUnit.module('noop', function() {
        QUnit.test('noop', function(assert) {
          assert.equal(main.noop(), null);
        });
      });

      /* TODO: Add at least one test for main.offline
      QUnit.module('offline', function() {
        QUnit.test('???', function(assert) {
          assert.equal(main.offline(), '???');
        });
      })
      */

      /* TODO: Add at least one test for main.offset
      QUnit.module('offset', function() {
        QUnit.test('???', function(assert) {
          assert.equal(main.offset(), '???');
        });
      })
      */

      /* TODO: Add at least one test for main.onDOMNodeRemoved
      QUnit.module('onDOMNodeRemoved', function() {
        QUnit.test('???', function(assert) {
          assert.equal(main.onDOMNodeRemoved(), '???');
        });
      })
      */

      /* TODO: Add at least one test for main.param
      QUnit.module('param', function() {
        QUnit.test('???', function(assert) {
          assert.equal(main.param(), '???');
        });
      })
      */

      /* TODO: Add at least one test for main.random_id
      QUnit.module('random_id', function() {
        QUnit.test('???', function(assert) {
          assert.equal(main.random_id(), '???');
        });
      })
      */

      /* TODO: Add at least one test for main.resolveIn
      QUnit.module('resolveIn', function() {
        QUnit.test('???', function(assert) {
          assert.equal(main.resolveIn(), '???');
        });
      })
      */

      /* TODO: Add at least one test for main.search
      QUnit.module('search', function() {
        QUnit.test('???', function(assert) {
          assert.equal(main.search(), '???');
        });
      })
      */

      /* TODO: Add at least one test for main.server_json_suffix
      QUnit.module('server_json_suffix', function() {
        QUnit.test('???', function(assert) {
          assert.equal(main.server_json_suffix(), '???');
        });
      })
      */

      /* TODO: Add at least one test for main.server_url
      QUnit.module('server_url', function() {
        QUnit.test('???', function(assert) {
          assert.equal(main.server_url(), '???');
        });
      })
      */

      /* TODO: Add at least one test for main.uniqueId
      QUnit.module('uniqueId', function() {
        QUnit.test('???', function(assert) {
          assert.equal(main.uniqueId(), '???');
        });
      })
      */

      QUnit.module('uniqueString', function() {
        // This depends on run order and is fragile.
        QUnit.test('default0', function(assert) {
          assert.equal(main.uniqueString(), "_default0");
        });
        QUnit.test('default1', function(assert) {
          assert.equal(main.uniqueString(), "_default1");
        });
        // TODO: Should this work? How do I define a domain?
        // QUnit.test('other', function(assert) {
        //   assert.equal(main.uniqueString(other), "other0");
        // });
      });

      /* TODO: Add at least one test for main.updateDropEffect
      QUnit.module('updateDropEffect', function() {
        QUnit.test('???', function(assert) {
          assert.equal(main.updateDropEffect(), '???');
        });
      })
      */

      /* TODO: Add at least one test for main.version
      QUnit.module('version', function() {
        QUnit.test('???', function(assert) {
          assert.equal(main.version(), '???');
        });
      })
      */



    });

  }
});
