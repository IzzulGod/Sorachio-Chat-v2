
exports.handler = async (event, context) => {
  console.log('🚀 Netlify function called');
  console.log('📝 Method:', event.httpMethod);
  console.log('📝 Headers:', event.headers);
  
  if (event.httpMethod !== 'POST') {
    console.log('❌ Method not allowed');
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    console.log('📝 Raw body:', event.body);
    const body = JSON.parse(event.body);
    console.log('✅ Parsed body:', body);
    
    console.log('🔑 API Key available:', !!process.env.OPENROUTER_API_KEY);
    console.log('🔑 API Key starts with:', process.env.OPENROUTER_API_KEY?.substring(0, 10) + '...');
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('📥 OpenRouter response status:', response.status);
    console.log('📥 OpenRouter response headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log('✅ OpenRouter response data:', data);
    
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
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error', details: error.message }),
    };
  }
};
