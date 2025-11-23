// Simple server-side proxy to forward requests to Hugging Face
// Usage: set HF_API_KEY in environment and run `node server.js`

const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;
const HF_API_KEY = process.env.HF_API_KEY || '';
const HF_CHAT_URL = 'https://api-inference.huggingface.co/v1/chat/completions';

app.use(bodyParser.json({ limit: '1mb' }));

// Simple request logger to help debugging
app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.url);
  next();
});

// Serve static files from project root so the UI is available from the same origin
app.use(express.static(path.join(__dirname)));

app.post('/api/generate', async (req, res) => {
  console.log('Handler /api/generate invoked');
  if (!HF_API_KEY) {
    return res.status(500).json({ error: 'Server missing HF_API_KEY. Set process.env.HF_API_KEY' });
  }

  console.log('Headers:', req.headers);
  console.log('Body payload start');
  console.log(JSON.stringify(req.body));
  console.log('Body payload end');

  const { model, inputs, parameters } = req.body;
  if (!model || !inputs) {
    return res.status(400).json({ error: 'model and inputs are required' });
  }

  try {
    console.log('Calling HF chat completions endpoint for model:', model);
    // Use the OpenAI-compatible chat completions endpoint on Hugging Face Inference.
    const hfRes = await fetch(HF_CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${HF_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: inputs }],
        // Map some parameters if present
        temperature: parameters?.temperature,
        max_tokens: parameters?.max_new_tokens,
      }),
    });

    console.log('HF response status:', hfRes.status);

    const text = await hfRes.text();
    console.log('HF response body:', text);
    const contentType = hfRes.headers.get('content-type') || '';

    // Forward status and response body
    res.status(hfRes.status);
    if (contentType.includes('application/json')) {
      try {
        return res.json(JSON.parse(text));
      } catch (e) {
        return res.send(text);
      }
    }

    return res.send(text);
  } catch (err) {
    console.error('Proxy error', err);
    return res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  if (!HF_API_KEY) console.warn('HF_API_KEY not set — set process.env.HF_API_KEY before starting the server');
});
