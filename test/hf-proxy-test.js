// Test Hugging Face proxy endpoint
const fetch = require('node-fetch');

const endpoint = 'http://localhost:8000/api/generate';
const model = 'mistralai/Mistral-7B-Instruct-v0.2';
const prompt = 'Say hello as an AI coach.';

async function testProxy() {
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, inputs: prompt, parameters: { max_new_tokens: 32, temperature: 0.7 } })
    });
    const contentType = res.headers.get('content-type') || '';
    let body;
    if (contentType.includes('application/json')) {
      body = await res.json();
    } else {
      body = await res.text();
    }
    console.log('Status:', res.status);
    console.log('Response:', body);
    if (res.status !== 200) {
      console.error('Non-200 response:', body);
    }
  } catch (err) {
    console.error('Proxy test error:', err);
  }
}

testProxy();
