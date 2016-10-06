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

    });

  }
});
