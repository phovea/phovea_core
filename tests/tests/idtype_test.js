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

    });

  }
});

