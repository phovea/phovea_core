define(["require", "exports", 'main'], function (require, exports, main) {
  exports.test = function(){

    QUnit.module('main', function() {

      QUnit.test('Object.keys', function(assert) {
        assert.deepEqual(Object.keys(main).sort(), [
          "IdPool",
          "_init", // TODO: private?
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
          "fix_id", // TODO: camel case?
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
          "random_id", // TODO: camel case?
          "resolveIn",
          "search",
          "server_json_suffix", // TODO: camel case?
          "server_url", // TODO: camel case?
          "uniqueId",
          "uniqueString",
          "updateDropEffect",
          "version"
        ]);
      });

      QUnit.module('IdPool', function() { // TODO: Should this be public?
        QUnit.test('Object.keys', function(assert) {
          assert.deepEqual(Object.keys(new main.IdPool()), ['counter', 'free']);
        });
      });

      /* TODO: Add at least one test for main._init
      QUnit.module('_init', function() {
        QUnit.test('???', function(assert) {
          assert.equal(main._init(), '???');
        });
      })
      */

      // TODO: Explain why these arg* methods are useful?

      QUnit.module('argFilter', function() {
        QUnit.test('evens', function(assert) {
          assert.deepEqual(
              main.argFilter(
                  [1,3,5, 2,4,6, 7,9,11],
                  function(x) {return x % 2 == 0;}
              ),
              [3,4,5]
          );
        });
      });

      /* TODO: Add at least one test for main.argList
         TODO: What implements IArguments? What is this used for?
      QUnit.module('argList', function() {
        QUnit.test('???', function(assert) {
          assert.equal(main.argList(), '???');
        });
      })
      */

      QUnit.module('argSort', function() {
        QUnit.test('by length', function(assert) {
          assert.deepEqual(main.argSort(
              ['lizard', 'marsupial', 'cat', 'dolphin'],
              function(a,b) {
                var a_b = a.length;
                var b_b = b.length;
                if (a_b < b_b) {
                  return -1;
                }
                if (a_b > b_b) {
                  return 1;
                }
                return 0;
              }
          ),
          [2,0,3,1]);
        });
      });

      /* TODO: Add at least one test for main.bind
      QUnit.module('bind', function() {
        QUnit.test('???', function(assert) {
          assert.equal(main.bind(), '???');
        });
      })
      */

      QUnit.module('bounds', function() {
        /* TODO: This seems odd. For instance, there is already
           an x and y provided by the DOM, but we give a different
           meaning to these.  */
        // TODO: Test sometimes breaks if console is open.
        // QUnit.test('body', function(assert) {
        //   var bounds = main.bounds(document.getElementsByTagName('body')[0]);
        //   assert.ok(bounds.x > 0);
        //   assert.ok(bounds.y > 0);
        //   assert.ok(bounds.w > 0);
        //   assert.ok(bounds.h > 0);
        // });
        QUnit.test('false', function(assert) {
          var bounds = main.bounds(false);
          assert.ok(bounds.x == 0);
          assert.ok(bounds.y == 0);
          assert.ok(bounds.w == 0);
          assert.ok(bounds.h == 0);
        });
        QUnit.test('not DOM', function(assert) {
          var bounds = main.bounds(false);
          assert.ok(bounds.x == 0);
          assert.ok(bounds.y == 0);
          assert.ok(bounds.w == 0);
          assert.ok(bounds.h == 0);
        });
      });

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

      // TODO: How is this used? And what's the desired behavior?
      QUnit.module('flagId', function() {
        QUnit.test('NaN', function(assert) {
          assert.equal(main.flagId(), null);
        });
        QUnit.test('domain', function(assert) {
          assert.equal(main.flagId('fake-domain'), null);
        });
        QUnit.test('domain + ID', function(assert) {
          assert.equal(main.flagId('fake-domain', 42), 42);
        });
      });

      QUnit.module('getter', function() {
        QUnit.test('one arg', function(assert) {
          getter = main.getter('a');
          assert.equal(getter({a: 42}), 42);
        });
        QUnit.test('two args', function(assert) {
          getter = main.getter('a', 'z');
          assert.deepEqual(getter({a: 42, z: 24}), [42, 24]);
        });
      });

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

      QUnit.module('identity', function() {
        function assert_identity(x) {
          QUnit.test(x, function(assert) {
            assert.deepEqual(main.identity(x), x);
          });
        }
        assert_identity(false);
        assert_identity(true);
        assert_identity(function(x){});
        assert_identity('string');
      });

      QUnit.module('indexOf', function() {
        QUnit.test('not in there', function(assert) {
          assert.equal(main.indexOf([1], function(x) {return x > 10}), -1);
        });
        QUnit.test('one match', function(assert) {
          assert.equal(main.indexOf([1,100], function(x) {return x > 10}), 1);
        });
        QUnit.test('two matches', function(assert) {
          assert.equal(main.indexOf([20,100], function(x) {return x > 10}), 0);
        });
      });

      QUnit.module('isFunction', function() {
        QUnit.test('built-in', function(assert) {
          assert.ok(main.isFunction(Math.sin));
        });
        QUnit.test('in-line', function(assert) {
          assert.ok(main.isFunction(function() {}));
        });
        QUnit.test('not a function', function(assert) {
          assert.notOk(main.isFunction('not a function'));
        });
      });

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

      QUnit.module('offline', function() {
        QUnit.test('offline', function(assert) {
          assert.equal(main.offline, false);
        });
      });

      // TODO: Fragile?
      // QUnit.module('offset', function() {
      //   QUnit.test('header', function(assert) {
      //     // fragile?
      //     assert.deepEqual(main.offset(document.getElementById('qunit-header')), {
      //       height: 48,
      //       left: 8,
      //       top: 8,
      //       width: window.innerWidth - 16
      //     });
      //   });
      // });

      QUnit.module('onDOMNodeRemoved', function() {
        QUnit.test('one node', function(assert) {
          // TODO: with assert.async, the test just stalls?
          //var done = assert.async();
          document.getElementById('qunit-fixture').innerHTML = '<div id="stub"></div>';
          var stub = document.getElementById('stub');
          main.onDOMNodeRemoved(stub, function() {
            assert.ok(true);
            //done();
          });
          stub.remove();
          assert.expect(0);
        });
        // TODO: two node list.
      });

      // TODO: Expose PropertyHandler for the sake of testing?
      // Running just against this url is fragile, and does not provide good coverage.
      QUnit.module('param', function() {
        QUnit.test('properties', function (assert) {
          assert.deepEqual(properties(main.param), [
            "forEach",
            "getInt",
            "getProp",
            "is",
            "keys",
            "map",
            "parse",
            "removeProp",
            "toString"
          ]);
        });
        QUnit.test('keys', function (assert) {
          assert.deepEqual(main.param.keys(), ['test']);
        });
      });

      QUnit.module('random_id', function() {
        QUnit.test('default', function(assert) {
          assert.ok(main.random_id().match(/^[0-9a-z]{8}$/));
        });
        QUnit.test('short', function(assert) {
          assert.ok(main.random_id(1).match(/^[0-9a-z]$/));
        });
      });

      QUnit.module('resolveIn', function() {
        QUnit.test('200ms', function(assert) {
          var done = assert.async();
          var past = Date.now();
          main.resolveIn(200).then(function() {
            var present = Date.now();
            var actual = present - past;
            assert.ok(actual >= 200);
            assert.ok(actual <= 300); // Could, conceivably, be even slower.
            done();
          })

        });
      });

      QUnit.module('search', function() {
        QUnit.test('no match', function(assert) {
          assert.equal(main.search(
              [1,2,3],
              function(x) {return x > 10}),
            undefined);
        });
        QUnit.test('multi match', function(assert) {
          assert.equal(main.search(
              [10,20,30],
              function(x) {return x > 10}),
            20);
        });
      });

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

      // TODO
      // QUnit.module('uniqueId', function() {
      //   // This depends on run order and is fragile.
      //   QUnit.test('first', function(assert) {
      //     assert.equal(main.uniqueId(), '0');
      //   });
      //   QUnit.test('second', function(assert) {
      //     assert.equal(main.uniqueId(), '1');
      //   });
      // });

      // TODO: behavior changed on Travis, and I'm not sure why.
      // QUnit.module('uniqueString', function() {
      //   // This depends on run order and is fragile.
      //   // QUnit.test('first', function(assert) {
      //   //   assert.equal(main.uniqueString(), "_default0");
      //   // });
      //   // QUnit.test('second', function(assert) {
      //   //   assert.equal(main.uniqueString(), "_default3");
      //   // });
      //   // TODO: Should this work? How do I define a domain?
      //   // QUnit.test('other', function(assert) {
      //   //   assert.equal(main.uniqueString(other), "other0");
      //   // });
      // });

      /* TODO: Add at least one test for main.updateDropEffect
      QUnit.module('updateDropEffect', function() {
        QUnit.test('???', function(assert) {
          assert.equal(main.updateDropEffect(), '???');
        });
      })
      */

      QUnit.module('version', function() { // TODO: Does anything actually consume this?
        QUnit.test('version', function(assert) {
          assert.equal(main.version, '0.0.1-alpha');
        });
      });

    });

  }
});
