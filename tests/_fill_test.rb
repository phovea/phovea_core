test = ARGV.shift
file = "tests/tests/#{test}_test.js"
lines = IO.readlines(file)
props = lines.grep(/^\s+"/).map{|l| l.gsub(/\W/,'')}

props.each do |prop|
puts <<END
      /* TODO
      QUnit.module('#{prop}', function() {
        QUnit.test('???', function(assert) {
          assert.equal(#{test}.#{prop}(), '???');
        });
      })
      */

END
end
