define(["require", "exports", 'idtype'], function (require, exports, idtype) {
  exports.test = function(){

    QUnit.module('idtype', function() {

      QUnit.test('Object.keys', function(assert) {
        assert.deepEqual(Object.keys(idtype), [
          "defaultSelectionType",
          "hoverSelectionType",
          "SelectOperation",
          "toSelectOperation",
          "IDType",
          "ProductIDType",
          "toId",
          "isId",
          "ObjectManager",
          "LocalIDAssigner",
          "createLocalAssigner",
          "SelectAble",
          "ProductSelectAble",
          "resolve",
          "resolveProduct",
          "list",
          "register",
          "persist",
          "restore",
          "clearSelection"
        ]);
      });

    });

  }
});

