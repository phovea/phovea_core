require 'selenium-webdriver'

driver = Selenium::WebDriver.for(:remote,
    url: "https://#{ENV['SAUCE_USERNAME']}:#{ENV['SAUCE_ACCESS_KEY']}@ondemand.saucelabs.com:443/wd/hub",
    desired_capabilities: {
      platform: "OS X 10.9",
      browserName: "firefox",
      version: "47.0",
      'tunnel-identifier' => ENV['TRAVIS_JOB_NUMBER']
    })

url = ARGV[0]
puts "Navigating to #{url}"
driver.navigate.to(url)

begin
  wait = Selenium::WebDriver::Wait.new(timeout: 10)
  wait.until { driver.find_element(css: '#qunit-testresult .failed') }
rescue Selenium::WebDriver::Error::TimeOutError
  #puts driver.page_source
  puts driver.find_element(css: 'body').text
  puts 'FAIL'
  exit 1
end

puts driver.find_element(css: 'body').text

fail_count = driver.find_element(css: '#qunit-testresult .failed').text
driver.quit # Is this necessary?
if fail_count == '0'
  puts 'PASS'
else
  puts 'FAIL'
  exit 1
end