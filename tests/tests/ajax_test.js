define(["require", "exports", 'ajax'], function (require, exports, ajax) {
  exports.test = function(){

    QUnit.module('ajax', function() {

      QUnit.test('Object.keys', function(assert) {
        assert.deepEqual(Object.keys(ajax).sort(), [
          "api2absURL",
          "encodeParams",
          "getAPIData",
          "getAPIJSON",
          "getData",
          "getJSON",
          "send",
          "sendAPI"
        ]);
      });

      QUnit.module('api2absURL', function() {
        // TODO: test that C.server_url and C.server_json_suffix are used.
        QUnit.test('no query', function(assert) {
          assert.equal(ajax.api2absURL('/path'), '/api/path');
        });
        QUnit.test('empty query', function(assert) {
          assert.equal(ajax.api2absURL('/path', {}), '/api/path');
        });
        QUnit.test('query', function(assert) {
          assert.equal(ajax.api2absURL('/path', {foo: 'bar'}), '/api/path?foo=bar');
        });
        QUnit.test('url w/ query', function(assert) {
          assert.equal(ajax.api2absURL('/path?query=fake', {foo: 'bar'}), '/api/path?query=fake&foo=bar');
        });
      });

      /*
      TODO: encodeParams is internal? Usage across all projects limited to:
      ./caleydo_d3/ajax_adapter_d3.ts:        data = ajax.encodeParams(data); //encode in url
      ./caleydo_d3/ajax_adapter_d3.ts:      xhr.send(method, data instanceof FormData ? data: ajax.encodeParams(data), (error, _raw) => {
      */

      QUnit.module('encodeParams', function() {
        QUnit.test('null', function(assert) {
          assert.equal(ajax.encodeParams(null), null);
        });
        QUnit.test('empty array', function(assert) {
          assert.equal(ajax.encodeParams([]), null);
        });
        QUnit.test('full array', function(assert) {
          assert.equal(ajax.encodeParams(['99% & \\', '\u2603', '2+2', 4]), '0=99%25+%26+%5C&1=%E2%98%83&2=2%2B2&3=4');
        });
        QUnit.test('hash', function(assert) {
          assert.equal(ajax.encodeParams({foo: 'bar'}), 'foo=bar');
        });
        QUnit.test('hash of array', function(assert) {
          assert.equal(ajax.encodeParams({foo: ['b', 'a', 'r']}), 'foo%5B%5D=b&foo%5B%5D=a&foo%5B%5D=r');
        });
        QUnit.test('hash of hash', function(assert) {
          assert.equal(ajax.encodeParams({foo: [{nested: true}, 'bar']}), 'foo%5B0%5D%5Bnested%5D=true&foo%5B%5D=bar');
        });
      });

      var xhr;
      var requests =[];
      QUnit.module('stub to exercise Sinon until Phovea AJAX works', {
        before: function() {
          xhr = sinon.useFakeXMLHttpRequest();
          xhr.onCreate = function (xhr) {
            requests.push(xhr);
          }
        },
        after: function() {
          xhr.restore();
        }
      }, function() {
        QUnit.test('stub', function(assert) {
          var done = assert.async();

          var httpRequest = new XMLHttpRequest();
          httpRequest.onreadystatechange = function() {
            console.log('readyState', this.readyState);
            if (this.readyState > 1) {
              // I don't really understand this part.
              return;
            }

            requests[ 0 ].respond([ 200 , {}, 'body' ]);
            if (this.readyState === XMLHttpRequest.DONE) {

              console.log('status', this.status);
              assert.equal(this.status, 200);
              done();
            }
          };
          httpRequest.open('GET', 'http://www.example.org/some.file');
        });
      });

      /*
      TODO: getAPIData is internal? Usage across all projects limited to:
      ./caleydo_core/matrix_impl.ts:      return ajax.getAPIData('/dataset/matrix/'+desc.id+'/raw', {
      ./caleydo_core/table_impl.ts:      return ajax.getAPIData('/dataset/table/'+desc.id+'/raw', {
      ./caleydo_core/table_impl.ts:      return ajax.getAPIData('/dataset/table/'+desc.id+'/col/'+column, {
      */

      /* TODO: Add at least one test for ajax.getAPIData
      // TODO: "C.registry is undefined"
      QUnit.module('getAPIData', function() {
        QUnit.test('???', function(assert) {
          assert.equal(ajax.getAPIData(), '???');
        });
      })
      */

      /* TODO: Add at least one test for ajax.getAPIJSON
      QUnit.module('getAPIJSON', function() {
        QUnit.test('???', function(assert) {
          assert.equal(ajax.getAPIJSON(), '???');
        });
      })
      */

      /* TODO: Add at least one test for ajax.getData
      QUnit.module('getData', function() {
        QUnit.test('???', function(assert) {
          assert.equal(ajax.getData(), '???');
        });
      })
      */

      /* TODO: Add at least one test for ajax.getJSON
      QUnit.module('getJSON', function() {
        QUnit.test('???', function(assert) {
          assert.equal(ajax.getJSON(), '???');
        });
      })
      */

      /* TODO: Add at least one test for ajax.send
      QUnit.module('send', function() {
        QUnit.test('???', function(assert) {
          assert.equal(ajax.send(), '???');
        });
      })
      */

      /*
      TODO: sendAPI is internal? Usage across all projects limited to:
      ./caleydo_core/data.ts:  return ajax.sendAPI('/dataset/',data, 'post').then(transformEntry);
      ./caleydo_core/data.ts:  return ajax.sendAPI('/dataset/'+entry.desc.id, data, 'put').then((desc) => {
      ./caleydo_core/data.ts:  return ajax.sendAPI('/dataset/'+entry.desc.id, data, 'post').then((desc) => {
      ./caleydo_core/data.ts:  return ajax.sendAPI('/dataset/'+desc.id, {}, 'delete').then((result) => {
      ./caleydo_core/graph.ts:    return ajax.sendAPI('/dataset/graph/' + this.desc.id + '/data').then((r) => {
      ./caleydo_core/graph.ts:    return ajax.sendAPI('/dataset/graph/' + this.desc.id + '/node', {
      ./caleydo_core/graph.ts:    return ajax.sendAPI('/dataset/graph/' + this.desc.id + '/node/'+n.id,{
      ./caleydo_core/graph.ts:    return ajax.sendAPI('/dataset/graph/' + this.desc.id + '/node/'+n.id, {}, 'delete').then((r) => {
      ./caleydo_core/graph.ts:      return ajax.sendAPI('/dataset/graph/' + this.desc.id + '/edge', {
      ./caleydo_core/graph.ts:    return ajax.sendAPI('/dataset/graph/' + this.desc.id + '/edge/'+e.id, {}, 'delete').then((r) => {
      ./caleydo_core/graph.ts:    return ajax.sendAPI('/dataset/graph/' + this.desc.id + '/edge/'+e.id, {
      ./caleydo_core/graph.ts:    return ajax.sendAPI('/dataset/graph/'+this.desc.id + '/node', {}, 'delete').then((r) => {
      */

      /* TODO: Add at least one test for ajax.sendAPI
      QUnit.module('sendAPI', function() {
        QUnit.test('???', function(assert) {
          assert.equal(ajax.sendAPI(), '???');
        });
      })
      */

    });

  }
});

