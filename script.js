// Cleaned script.js (full overwrite) — valid JS only
// NOTE: don't put real API keys in source control. Use a local config file or a meta tag.
// The app will read the key from (in order):
// 1) window.__HF_API_KEY (from a local file `config.local.js` you create and gitignore)
// 2) a meta tag: <meta name="hf-api-key" content="...">
// Otherwise HF_API_KEY will be empty and calls will fail with a clear error.
const HF_API_KEY = window.__HF_API_KEY || document.querySelector('meta[name="hf-api-key"]')?.content || "";
const HF_MODEL = "mistralai/Mistral-7B-Instruct-v0.2";

const scenarioSelect = document.getElementById("scenarioSelect");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const chatOutput = document.getElementById("chatOutput");

const roleSelect = document.getElementById("roleSelect");
const contextInput = document.getElementById("contextInput");
const planBtn = document.getElementById("planBtn");
const planOutput = document.getElementById("planOutput");

const SCENARIO_PROMPTS = {
  panel_interruption: `Scenario: You are on a panel. A female founder is repeatedly interrupted and talked over by male panelists. You are a male ally on the panel.

Task for the ally: Describe exactly what you would say or do in the moment to support her and shift the dynamic. Be specific, concrete, and realistic in the given power context.`,
  investor_bias: `Scenario: An investor keeps asking a female founder biased questions about "risk", "stability", and her family, which they do not ask male founders.

Task for the ally: Explain exactly what you would say or do to call out the bias and reframe the conversation without making the founder pay a social cost.`,
  sexist_joke: `Scenario: In a mixed-gender founder meetup, someone makes a "joke" that is casually sexist about women founders. People laugh uncomfortably.

Task for the ally: Show how you would respond in real time so that you signal clearly the joke is not acceptable while keeping the target safe.`
};

const SYSTEM_INSTRUCTIONS = `You are ALLY Coach, an AI designed to help men practice real allyship for women founders.

- Give specific, behavior-level feedback.
- Name what is helpful and what is harmful.
- Offer a few alternative sentences they could say.
- Always center the needs, safety, and agency of women founders.
- Keep answers under 250 words.`;

async function callHuggingFace(prompt) {
  // Proxy via local server so the API key stays on the server
  const res = await fetch(`/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: HF_MODEL, inputs: prompt, parameters: { max_new_tokens: 320, temperature: 0.7 } }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Proxy error: ${res.status} ${text}`);
  }

  // Hugging Face may return different shapes (string or array/object)
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const data = await res.json();
    if (Array.isArray(data) && data[0] && data[0].generated_text) return data[0].generated_text;
    if (data.generated_text) return data.generated_text;
    return JSON.stringify(data, null, 2);
  }

  return await res.text();
}

sendBtn.addEventListener("click", async () => {
  const scenarioKey = scenarioSelect.value;
  const userText = userInput.value.trim();

  if (!userText) {
    alert("Write what you would do first.");
    return;
  }

  const scenario = SCENARIO_PROMPTS[scenarioKey] || "";

  const fullPrompt = `${SYSTEM_INSTRUCTIONS}

Scenario:
${scenario}

Ally attempt:
"${userText}"

Your job:
1) Briefly say what parts of this response are helpful and why.
2) Point out any risks or unhelpful patterns (e.g., centering themselves, tone).
3) Rewrite the response as two or three concrete options the ally could try next time.
Use clear bullet points and plain language.`;

  chatOutput.textContent = "Thinking...";
  sendBtn.disabled = true;

  try {
    const result = await callHuggingFace(fullPrompt);
    chatOutput.textContent = cleanAssistantOutput(result);
  } catch (err) {
    console.error(err);
    chatOutput.textContent = "There was an error talking to the model. Please try again.";
  } finally {
    sendBtn.disabled = false;
  }
});

planBtn.addEventListener("click", async () => {
  const role = roleSelect.value;
  const context = contextInput.value.trim() || "early-stage startup ecosystem";

  const prompt = `${SYSTEM_INSTRUCTIONS}

You will now create a 30-day allyship action plan.

Person:
- Role: ${role}
- Context: ${context}

Write a 30-day plan structured as:
- Week 1: Awareness (small actions)
- Week 2: Listening + learning (actions)
- Week 3: Using influence (actions)
- Week 4: Accountability and long-term habits (actions)

Rules:
- Focus on women founders and their needs.
- No hero narratives. No "savior" framing.
- Actions should be realistic, specific, and time-bounded.
- Keep total length under 400 words.`;

  planOutput.textContent = "Generating...";
  planBtn.disabled = true;

  try {
    const result = await callHuggingFace(prompt);
    planOutput.textContent = cleanAssistantOutput(result);
  } catch (err) {
    console.error(err);
    planOutput.textContent = "There was an error generating the plan. Please try again.";
  } finally {
    planBtn.disabled = false;
  }
});

function cleanAssistantOutput(text) {
  if (!text) return "";
  const idx = text.indexOf("Week 1");
  if (idx !== -1) return text.slice(idx).trim();
  return text.trim();
}
 