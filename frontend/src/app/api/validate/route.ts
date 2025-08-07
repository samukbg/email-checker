import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Connect to the Ruby Truemail server

    // Try different API endpoints that might exist
    const endpoint = 'https://trueemail-checker.fly.dev/validate';

    let lastError;

    try {
      console.log(`Trying endpoint: ${endpoint}`);
      
      // For the root endpoint, try GET first to see if server is alive
      if (endpoint.endsWith('/')) {
        const healthCheck = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'User-Agent': 'EmailChecker/1.0'
          }
        });
        console.log(`Health check ${endpoint}: ${healthCheck.status}`);
        if (healthCheck.status === 502) {
          lastError = `${endpoint}: Server is down (502)`;
        }
      }

      // Try to create form data for file upload (like the Ruby server expects)
      const formData = new FormData();
      const emailBlob = new Blob([email], { type: 'text/plain' });
      formData.append('file', emailBlob, 'emails.txt');

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer qwerty12345`,
          'X-Auth-Token': 'qwerty12345',
        },
        body: formData,
      });

        console.log(`Response status: ${response.status}`);

        if (response.ok) {
          const result = await response.json();
          // Handle array response from Ruby server
          if (Array.isArray(result) && result.length > 0) {
            const emailResult = result[0];
            return NextResponse.json({
              success: emailResult.success || false,
              configuration: emailResult.configuration || {},
            });
          }
          return NextResponse.json({
            success: result.success || false,
            configuration: result.configuration || {},
          });
        }

        lastError = `${endpoint}: ${response.status}`;
      } catch (err) {
        console.log(`Failed ${endpoint}:`, err);
        lastError = `${endpoint}: ${err}`;
      }

    // If all endpoints fail, return an error
    console.log('All endpoints failed');
    return NextResponse.json({ error: `Failed to validate email. Last error: ${lastError}` }, { status: 500 });

  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json(
      { error: 'Failed to validate email' },
      { status: 500 }
    );
  }
}
