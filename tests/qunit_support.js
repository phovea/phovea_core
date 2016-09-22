function qunit_module(name, timeout) {
  QUnit.module(name,{
    beforeEach: function() {
      window[name]($('#qunit-fixture'));
      this.timeout = timeout ? timeout : 0;
    }
  });
}

function qunit_test_includes(name, needle) {
  QUnit.test(name, function(assert) {
    assert_includes(assert, needle, this.timeout);
  });
}

function assert_includes(assert, needle, timeout) {
  assert_with_timeout(assert, timeout, function() {
    var haystack = $('#qunit-fixture').html();
    assert.ok(includes(haystack, needle), needle + ' not in ' + haystack);
  });
}

function assert_with_timeout(assert, timeout, assertion) {
  var done = assert.async();
  window.setTimeout(function(){
    assertion(assert);
    done();
  }, timeout);
}

function includes(haystack, needle) {
  // String.prototype.includes exists in recent versions,
  // but this can save you from one cryptic error if you are out of date.
  return haystack.indexOf(needle) !== -1
}