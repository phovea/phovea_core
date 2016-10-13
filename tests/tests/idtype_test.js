define(["require", "exports", 'idtype'], function (require, exports, idtype) {
  exports.test = function(){

    QUnit.module('idtype', function() {

      QUnit.test('Object.keys', function(assert) {
        assert.deepEqual(Object.keys(idtype).sort(), [
          "IDType",
          "LocalIDAssigner",
          "ObjectManager",
          "ProductIDType",
          "ProductSelectAble",
          "SelectAble",
          "SelectOperation",
          "clearSelection",
          "createLocalAssigner",
          "defaultSelectionType",
          "hoverSelectionType",
          "isId",
          "list",
          "persist",
          "register",
          "resolve",
          "resolveProduct",
          "restore",
          "toId",
          "toSelectOperation"
        ]);
      });

      /* TODO: Add at least one test for idtype.IDType
      QUnit.module('IDType', function() {
        QUnit.test('???', function(assert) {
          assert.equal(idtype.IDType(), '???');
        });
      })
      */

      /* TODO: Add at least one test for idtype.LocalIDAssigner
      QUnit.module('LocalIDAssigner', function() {
        QUnit.test('???', function(assert) {
          assert.equal(idtype.LocalIDAssigner(), '???');
        });
      })
      */

      /* TODO: Add at least one test for idtype.ObjectManager
      QUnit.module('ObjectManager', function() {
        QUnit.test('???', function(assert) {
          assert.equal(idtype.ObjectManager(), '???');
        });
      })
      */

      /* TODO: Add at least one test for idtype.ProductIDType
      QUnit.module('ProductIDType', function() {
        QUnit.test('???', function(assert) {
          assert.equal(idtype.ProductIDType(), '???');
        });
      })
      */

      /* TODO: Add at least one test for idtype.ProductSelectAble
      QUnit.module('ProductSelectAble', function() {
        QUnit.test('???', function(assert) {
          assert.equal(idtype.ProductSelectAble(), '???');
        });
      })
      */

      /* TODO: Add at least one test for idtype.SelectAble
      QUnit.module('SelectAble', function() {
        QUnit.test('???', function(assert) {
          assert.equal(idtype.SelectAble(), '???');
        });
      })
      */

      /* TODO: Add at least one test for idtype.SelectOperation
      QUnit.module('SelectOperation', function() {
        QUnit.test('???', function(assert) {
          assert.equal(idtype.SelectOperation(), '???');
        });
      })
      */

      /* TODO: Add at least one test for idtype.clearSelection
      QUnit.module('clearSelection', function() {
        QUnit.test('???', function(assert) {
          assert.equal(idtype.clearSelection(), '???');
        });
      })
      */

      /* TODO: Add at least one test for idtype.createLocalAssigner
      QUnit.module('createLocalAssigner', function() {
        QUnit.test('???', function(assert) {
          assert.equal(idtype.createLocalAssigner(), '???');
        });
      })
      */

      /* TODO: Add at least one test for idtype.defaultSelectionType
      QUnit.module('defaultSelectionType', function() {
        QUnit.test('???', function(assert) {
          assert.equal(idtype.defaultSelectionType(), '???');
        });
      })
      */

      /* TODO: Add at least one test for idtype.hoverSelectionType
      QUnit.module('hoverSelectionType', function() {
        QUnit.test('???', function(assert) {
          assert.equal(idtype.hoverSelectionType(), '???');
        });
      })
      */

      /* TODO: Add at least one test for idtype.isId
      QUnit.module('isId', function() {
        QUnit.test('???', function(assert) {
          assert.equal(idtype.isId(), '???');
        });
      })
      */

      /* TODO: Add at least one test for idtype.list
      QUnit.module('list', function() {
        QUnit.test('???', function(assert) {
          assert.equal(idtype.list(), '???');
        });
      })
      */

      /* TODO: Add at least one test for idtype.persist
      QUnit.module('persist', function() {
        QUnit.test('???', function(assert) {
          assert.equal(idtype.persist(), '???');
        });
      })
      */

      /* TODO: Add at least one test for idtype.register
      QUnit.module('register', function() {
        QUnit.test('???', function(assert) {
          assert.equal(idtype.register(), '???');
        });
      })
      */

      /* TODO: Add at least one test for idtype.resolve
      QUnit.module('resolve', function() {
        QUnit.test('???', function(assert) {
          assert.equal(idtype.resolve(), '???');
        });
      })
      */

      /* TODO: Add at least one test for idtype.resolveProduct
      QUnit.module('resolveProduct', function() {
        QUnit.test('???', function(assert) {
          assert.equal(idtype.resolveProduct(), '???');
        });
      })
      */

      /* TODO: Add at least one test for idtype.restore
      QUnit.module('restore', function() {
        QUnit.test('???', function(assert) {
          assert.equal(idtype.restore(), '???');
        });
      })
      */

      /* TODO: Add at least one test for idtype.toId
      QUnit.module('toId', function() {
        QUnit.test('???', function(assert) {
          assert.equal(idtype.toId(), '???');
        });
      })
      */

      /* TODO: Add at least one test for idtype.toSelectOperation
      QUnit.module('toSelectOperation', function() {
        QUnit.test('???', function(assert) {
          assert.equal(idtype.toSelectOperation(), '???');
        });
      })
      */

    });

  }
});

