# ALLY Coach (local Ollama build)

Small static prototype for practicing allyship scenarios. The frontend now talks directly to a local Ollama instance so no cloud API key is required.

## Files
- `index.html` — main UI
- `style.css` — styles
- `script.js` — client-side logic (calls Ollama at `http://localhost:11434`)
- `server.js` — legacy Hugging Face proxy (not needed for Ollama, kept for reference)

## Prerequisites
- [Ollama](https://ollama.com/download) installed locally
- Model pulled: `ollama pull llama3`
- Node.js (for the smoke test)

## Run locally
1. Start Ollama (usually `ollama serve` if it is not already running).
2. In this folder, start a simple static server (Python example):
   ```bash
   python3 -m http.server 8000
   ```
3. Open http://localhost:8000 in your browser. The app will call Ollama on http://localhost:11434.

## Smoke test
A minimal smoke test checks required element IDs in `index.html`.

```bash
npm install   # installs dev deps for the test runner
npm test      # runs test/smoke.js
```

## Troubleshooting
- **"Ollama API error" in the UI:** Ensure `ollama serve` is running and the `llama3` model is available locally.
- **CORS errors:** Load the page from `http://localhost:*` so the browser can reach the local Ollama port.
- **Server proxy path errors:** The app no longer uses `/api/generate`; point the browser to the static server and ensure Ollama is running.
