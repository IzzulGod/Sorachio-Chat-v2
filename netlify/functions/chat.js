
exports.handler = async (event, context) => {
  console.log('🚀 Netlify function called');
  console.log('📝 Method:', event.httpMethod);
  console.log('📝 Headers:', event.headers);
  
  if (event.httpMethod !== 'POST') {
    console.log('❌ Method not allowed');
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    console.log('📝 Raw body length:', event.body?.length);
    const body = JSON.parse(event.body);
    console.log('✅ Parsed body model:', body.model);
    console.log('✅ Messages count:', body.messages?.length);
    
    // Check if we have image content
    const hasImage = body.messages?.some(msg => 
      Array.isArray(msg.content) && 
      msg.content.some(item => item.type === 'image_url')
    );
    console.log('🖼️ Has image content:', hasImage);
    
    console.log('🔑 API Key available:', !!process.env.OPENROUTER_API_KEY);
    
    // Start the request
    console.log('📤 Making request to OpenRouter...');
    const startTime = Date.now();
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const requestTime = Date.now() - startTime;
    console.log('📥 OpenRouter response status:', response.status);
    console.log('⏱️ Request took:', requestTime, 'ms');

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenRouter error:', errorText);
      return {
        statusCode: response.status,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: JSON.stringify({ 
          error: 'OpenRouter API Error', 
          details: errorText,
          status: response.status 
        }),
      };
    }

    const data = await response.json();
    console.log('✅ OpenRouter response received');
    console.log('📊 Response tokens:', data.usage);
    
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
    
    // Better error handling for different error types
    let errorDetails = error.message;
    let statusCode = 500;
    
    if (error.name === 'SyntaxError') {
      errorDetails = 'Invalid JSON in request body';
      statusCode = 400;
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      errorDetails = 'Unable to connect to OpenRouter API';
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
        timestamp: new Date().toISOString()
      }),
    };
  }
};
