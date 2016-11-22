define(["require", "exports", 'stratification'], function (require, exports, stratification) {
  exports.test = function(){

    QUnit.module('stratification', function() {

      QUnit.test('Object.keys', function(assert) {
        assert.deepEqual(Object.keys(stratification).sort(), [
          "StratificationGroup",
          "guessColor"
        ]);
      });

      QUnit.module('StratificationGroup', function() {
        QUnit.test('properties', function(assert) {
          assert.deepEqual(properties(new stratification.StratificationGroup()), [
            "accumulateEvents",
            "clear",
            "constructor",
            "desc",
            "dim",
            "fillAndSend",
            "fire",
            "fireEvent",
            "fromIdRange",
            "group",
            "groupDesc",
            "groupIndex",
            "groups",
            "handlers",
            "hist",
            "idRange",
            "idView",
            "ids",
            "idtype",
            "idtypes",
            "length",
            "list",
            "names",
            "ngroups",
            "numSelectListeners",
            "off",
            "on",
            "origin",
            "persist",
            "propagate",
            "range",
            "rangeGroup",
            "restore",
            "root",
            "select",
            "selectImpl",
            "selectionCache",
            "selectionListener",
            "selectionListeners",
            "selections",
            "singleSelectionListener",
            "size",
            "toString",
            "vector"
          ]);

          // TODO: test these methods.
        });
      });

      QUnit.module('guessColor', function() {
        QUnit.test('colors', function(assert) {
          // TODO: Unused argument is weird.
          assert.equal(stratification.guessColor('unused', 'MALE'), 'blue');
          assert.equal(stratification.guessColor('unused', 'female'), 'red');
          assert.equal(stratification.guessColor('unused', 'Deceased'), '#e41a1b');
          assert.equal(stratification.guessColor('unused', 'lIvInG'), '#377eb8');
          assert.equal(stratification.guessColor('unused', 'other-unknown-whatever'), 'gray');
        });
      });

    });

  }
});
