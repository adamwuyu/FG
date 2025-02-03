// test-request.js
const axios = require('axios');

async function testRequest() {
  try {
    const response = await axios.post(
      'https://api.superoceansh.com/v1/chat/completions',
      {
        model: 'gpt-4o',
        messages: [{ role: 'user', content: 'Say hello.' }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer sk-Kf7pfLmit4E4aw9t818fC8C426Ab4608A04153F5037e8770'
        },
        timeout: 30000
      }
    );
    console.log('Success:', response.data);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testRequest();
