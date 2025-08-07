require 'rack'
require 'json'
require 'truemail'

class App
  def call(env)
    req = Rack::Request.new(env)

    # Handle CORS preflight requests
    if req.request_method == 'OPTIONS'
      return cors_response
    end

    # Add CORS headers to all responses
    if req.post? && req.path == '/validate'
      response = handle_validation(req)
      return add_cors_headers(response)
    else
      response = [404, { 'content-type' => 'text/plain' }, ['Not Found']]
      return add_cors_headers(response)
    end
  end

  private

  def handle_validation(req)
    # Check authentication
    auth_token = req.get_header('HTTP_AUTHORIZATION')&.sub('Bearer ', '') || 
                 req.get_header('HTTP_X_AUTH_TOKEN') || 
                 req.params['token']
    
    expected_token = ENV['API_TOKEN'] || raise('API_TOKEN environment variable is required')
    return [401, { 'content-type' => 'text/plain' }, ['Unauthorized']] unless auth_token == expected_token

    file = req.params['file']
    return [400, { 'content-type' => 'text/plain' }, ['File not provided']] unless file

    emails = file[:tempfile].read.lines.map(&:strip).reject(&:empty?)
    
    Truemail.configure do |config|
      config.verifier_email = ENV['VERIFIER_EMAIL']
      config.verifier_domain = ENV['VERIFIER_DOMAIN']
      config.smtp_safe_check = ENV['SMTP_SAFE_CHECK'] == 'true'
    end

    results = emails.map do |email|
      JSON.parse(Truemail.validate(email).as_json)
    end

    [200, { 'content-type' => 'application/json' }, [results.to_json]]
  rescue => e
    [500, { 'content-type' => 'text/plain' }, ["Error: #{e.message}"]]
  end

  def cors_response
    [200, cors_headers, ['']]
  end

  def add_cors_headers(response)
    status, headers, body = response
    headers.merge!(cors_headers)
    [status, headers, body]
  end

  def cors_headers
    {
      'access-control-allow-origin' => '*',
      'access-control-allow-methods' => 'POST, OPTIONS',
      'access-control-allow-headers' => 'Content-Type, Authorization, X-Auth-Token',
      'access-control-max-age' => '86400'
    }
  end
end
