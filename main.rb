require 'truemail/client'
require 'json'

Truemail::Client.configure do |config|
  config.host = ENV['TRUEMAIL_HOST'] || 'trueemail-checker.fly.dev'
  config.port = 443
  config.token = ENV['TRUEMAIL_TOKEN'] || raise('TRUEMAIL_TOKEN environment variable is required')
  config.secure_connection = true
end

file_path = 'emails.txt'

if File.exist?(file_path)
  File.foreach(file_path) do |line|
    email = line.strip
    next if email.empty?

    raw_result = Truemail::Client.validate(email)
    result = JSON.parse(raw_result)
    
    puts "Validation for #{email}:"

    if result["success"]
      puts "  - Email exists: Yes"
    else
      puts "  - Email exists: No"
    end

    if result["configuration"] && result["configuration"]["blacklisted_domains"] && !result["configuration"]["blacklisted_domains"].empty?
      puts "  - Blacklisted: Yes"
    else
      puts "  - Blacklisted: No"
    end
    puts "-" * 30
  end
else
  puts "Error: #{file_path} not found."
end
