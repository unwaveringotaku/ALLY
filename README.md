# ALLY Coach (local dev)

Small static prototype for practicing allyship scenarios. This workspace contains three main files:

# ALLY Coach (local dev)

Small static prototype for practicing allyship scenarios. This workspace contains three main files:

- `index.html` — main UI
- `style.css` — styles
- `script.js` — client-side logic (calls an external model endpoint)

Security note

- Do not store real API keys in source control. For local testing, inject the key at runtime using a local file (recommended) or run the provided server-side proxy (recommended).

Run locally (quick)

You have two ways to talk to the model:

- **Client-side key (fastest):** add your Hugging Face token to `config.local.js` (kept out of git). The browser will call the HF router directly.
- **Server proxy:** run `node server.js` with `HF_API_KEY` set. The browser will post to `/api/generate` and the server forwards to HF so the key stays server-side.

Quick test with client-side key:

1. Create `config.local.js` with your token (see below).
2. Start a simple static server (Python builtin):

```bash
python3 -m http.server 8000
```

3. Open http://localhost:8000 in your browser.

Proxy setup (keeps key off the client):

1. Set the HF API key in an environment variable and start the provided Node server. Example (macOS / Linux / zsh):

```bash
export HF_API_KEY='hf_YOUR_TOKEN_HERE'
node server.js
```

2. Open http://localhost:8000 in your browser. The UI will use `/api/generate` served by `server.js`.

Smoke test

There is a minimal smoke test that checks the page contains required element IDs. To run it:

```bash
npm install   # installs dev deps (nodemon) and runtime deps (express/node-fetch)
npm test      # runs the node-based smoke test
```

Test implementation details

- `test/smoke.js` reads `index.html` and asserts the presence of key element IDs used by `script.js`.

Using the Hugging Face token (safe local option)

Option A — local config (client-side, for quick dev):

1. Create a local file named `config.local.js` in the project root. Add this single line and replace the placeholder with your token:

```javascript
window.__HF_API_KEY = "hf_YOUR_TOKEN_HERE";
```

2. Make sure `config.local.js` is not committed. This repo includes a `.gitignore` entry for `config.local.js`.

Option B — server-side proxy (recommended):

1. Set the HF API key in an environment variable and start the provided Node server. Example (macOS / Linux / zsh):

```bash
export HF_API_KEY='hf_YOUR_TOKEN_HERE'
node server.js
```

The server serves static files and exposes `/api/generate` which forwards to the Hugging Face Inference API using the server-side token. This keeps the key off the client and is the recommended setup for local development.

2. Open http://localhost:8000 in your browser.

Security note: never push your token to a public repository. Keep it local or use a secure secret manager.

Common errors

- `model_not_supported`: Your HF token does not have access to the chosen model. Switch `HF_MODEL` in `script.js` to a model you can use (e.g., a permissive open model) or request access on Hugging Face.
- `Local proxy (start with node server.js ... ) error 404`: You launched a static server without the proxy. Either add a client-side token via `config.local.js` or start `node server.js` with `HF_API_KEY` set.
- `Proxy error 405`: The POST to "/api/generate" hit a server that does not handle it (e.g., a static server). Start `node server.js` with `HF_API_KEY` set, or add a client-side token so the browser can call Hugging Face directly.

Next steps you might want

- Add a basic mock for the model API so the UI can be tested end-to-end without a key.
- Add accessibility improvements like visible focus styles and additional labels.
- Wire environment variable loading for the API key into a CI/CD secret manager for deployments.
