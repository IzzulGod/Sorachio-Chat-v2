exports.handler = async (event, context) => {
  console.log('🚀 Netlify function called');
  console.log('📝 Method:', event.httpMethod);
  console.log('📝 Headers:', event.headers);
  
  if (event.httpMethod !== 'POST') {
    console.log('❌ Method not allowed');
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Debug environment variables
    console.log('🌍 All environment keys:', Object.keys(process.env));
    console.log('🌍 NODE_ENV:', process.env.NODE_ENV);
    console.log('🌍 NETLIFY:', process.env.NETLIFY);
    
    // Check API key first
    const apiKey = process.env.OPENROUTER_API_KEY;
    console.log('🔑 API Key exists:', !!apiKey);
    console.log('🔑 API Key length:', apiKey ? apiKey.length : 0);
    console.log('🔑 API Key prefix:', apiKey ? apiKey.substring(0, 8) + '...' : 'MISSING');
    console.log('🔑 Raw API Key type:', typeof apiKey);
    
    // More thorough API key validation
    if (!apiKey || apiKey.trim() === '' || apiKey === 'undefined') {
      console.error('❌ OPENROUTER_API_KEY not found or invalid in environment variables');
      console.error('❌ Available env vars:', Object.keys(process.env).filter(key => key.includes('OPENROUTER')));
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: JSON.stringify({ 
          error: 'Server Configuration Error', 
          details: 'API key not configured. Please set OPENROUTER_API_KEY environment variable.',
          timestamp: new Date().toISOString(),
          debug: {
            apiKeyExists: !!apiKey,
            apiKeyType: typeof apiKey,
            envKeys: Object.keys(process.env).filter(key => key.includes('OPENROUTER'))
          }
        }),
      };
    }
    
    console.log('📝 Raw body length:', event.body?.length);
    const body = JSON.parse(event.body);
    console.log('✅ Parsed body model:', body.model);
    console.log('✅ Messages count:', body.messages?.length);
    
    // Check if we have image content
    const hasImage = body.messages?.some(msg => 
      Array.isArray(msg.content) && 
      msg.content.some(item => item.type === 'image_url')
    );
    console.log('🖼 Has image content:', hasImage);
    
    // Start the request
    console.log('📤 Making request to OpenRouter...');
    const startTime = Date.now();
    
    // FIXED: Proper template literal syntax
    const requestHeaders = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://sorachio.netlify.app',
      'X-Title': 'Sorachio Chat App',
    };
    
    console.log('📤 Request headers (without auth):', { 
      'Content-Type': requestHeaders['Content-Type'],
      'HTTP-Referer': requestHeaders['HTTP-Referer'],
      'X-Title': requestHeaders['X-Title']
    });
    
    // Log the actual authorization header format (without exposing the key)
    console.log('🔑 Auth header format check:', requestHeaders['Authorization'].startsWith('Bearer '));
    console.log('🔑 Auth header length:', requestHeaders['Authorization'].length);
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(body),
    });

    const requestTime = Date.now() - startTime;
    console.log('📥 OpenRouter response status:', response.status);
    console.log('📥 OpenRouter response headers:', Object.fromEntries(response.headers.entries()));
    console.log('⏱ Request took:', requestTime, 'ms');

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenRouter error response:', errorText);
      console.error('❌ OpenRouter error status:', response.status);
      console.error('❌ OpenRouter error headers:', Object.fromEntries(response.headers.entries()));
      
      // Parse the error if it's JSON
      let errorDetails = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        errorDetails = errorJson.error?.message || errorText;
        console.error('❌ Parsed error message:', errorDetails);
      } catch (e) {
        console.error('❌ Could not parse error as JSON');
      }
      
      return {
        statusCode: response.status,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: JSON.stringify({ 
          error: 'OpenRouter API Error', 
          details: errorDetails,
          status: response.status,
          originalError: errorText,
          timestamp: new Date().toISOString()
        }),
      };
    }

    const data = await response.json();
    console.log('✅ OpenRouter response received');
    console.log('📊 Response tokens:', data.usage);
    console.log('📊 Response choices count:', data.choices?.length);
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('❌ Netlify function error:', error);
    console.error('❌ Error stack:', error.stack);
    
    // Better error handling for different error types
    let errorDetails = error.message;
    let statusCode = 500;
    
    if (error.name === 'SyntaxError') {
      errorDetails = 'Invalid JSON in request body';
      statusCode = 400;
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      errorDetails = 'Unable to connect to OpenRouter API';
      statusCode = 502;
    } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
      errorDetails = 'Network error connecting to OpenRouter API';
      statusCode = 502;
    }
    
    return {
      statusCode,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ 
        error: 'Internal Server Error', 
        details: errorDetails,
        timestamp: new Date().toISOString(),
        errorType: error.name,
        originalMessage: error.message
      }),
    };
  }
};
