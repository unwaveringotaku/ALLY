const scenarioSelect = document.getElementById("scenarioSelect");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const chatOutput = document.getElementById("chatOutput");

const roleSelect = document.getElementById("roleSelect");
const contextInput = document.getElementById("contextInput");
const planBtn = document.getElementById("planBtn");
const planOutput = document.getElementById("planOutput");

const SCENARIO_PROMPTS = {
  panel_interruption: `
Scenario: You are on a panel. A female founder is repeatedly interrupted and talked over 
by male panelists. You are a male ally on the panel.

Task for the ally: Describe exactly what you would say or do in the moment to support her and 
shift the dynamic. Be specific, concrete, and realistic in the given power context.
`,
  investor_bias: `
Scenario: An investor keeps asking a female founder biased questions about "risk", 
"stability", and her family, which they do not ask male founders.

Task for the ally: Explain exactly what you would say or do to call out the bias and 
reframe the conversation without making the founder pay a social cost.
`,
  sexist_joke: `
Scenario: In a mixed-gender founder meetup, someone makes a "joke" that is casually sexist 
about women founders. People laugh uncomfortably.

Task for the ally: Show how you would respond in real time so that you signal clearly 
the joke is not acceptable while keeping the target safe.
`
};

const SYSTEM_INSTRUCTIONS = `
You are ALLY Coach, an AI designed to help men practice real allyship for women founders.

You:
- Give specific, behavior-level feedback.
- Name what is helpful and what is harmful.
- Offer 2–3 alternative sentences they could say.
- Always center the needs, safety, and agency of women founders.
- Keep answers under 250 words.
`;

// Core function to call Ollama local API
async function callOllama(messages) {
  const response = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3", // ensure you pulled this: `ollama pull llama3`
      messages,
      stream: false
    })
  });

  if (!response.ok) {
    throw new Error("Ollama API error: " + response.status);
  }

  const data = await response.json();
  // Ollama returns: { message: { role: "assistant", content: "..." }, ... }
  return data.message && data.message.content
    ? data.message.content
    : JSON.stringify(data, null, 2);
}

// Handle scenario coaching
sendBtn.addEventListener("click", async () => {
  const scenarioKey = scenarioSelect.value;
  const userText = userInput.value.trim();

  if (!userText) {
    alert("Write what you would do first.");
    return;
  }

  const scenario = SCENARIO_PROMPTS[scenarioKey];

  const userPrompt = `
Scenario:
${scenario}

Ally attempt:
"${userText}"

Your job:
1) Briefly say what parts of this response are helpful and why.
2) Point out any risks or unhelpful patterns (for example centering themselves, tone).
3) Rewrite the response as two or three concrete options the ally could try next time.
Use clear bullet points and plain language.
`;

  chatOutput.textContent = "Thinking...";
  sendBtn.disabled = true;

  try {
    const result = await callOllama([
      { role: "system", content: SYSTEM_INSTRUCTIONS },
      { role: "user", content: userPrompt }
    ]);
    chatOutput.textContent = result.trim();
  } catch (err) {
    console.error(err);
    chatOutput.textContent =
      "There was an error talking to the model. Check that Ollama is running on your machine.";
  } finally {
    sendBtn.disabled = false;
  }
});

// Handle 30-day action plan
planBtn.addEventListener("click", async () => {
  const role = roleSelect.value;
  const context = contextInput.value.trim() || "early-stage startup ecosystem";

  const planPrompt = `
You will now create a 30-day allyship action plan.

Person:
- Role: ${role}
- Context: ${context}

Write a 30-day plan structured as:
- Week 1: Awareness (3–4 small actions)
- Week 2: Listening and learning (3–4 actions)
- Week 3: Using influence (3–4 actions)
- Week 4: Accountability and long-term habits (3–4 actions)

Rules:
- Focus on women founders and their needs.
- No hero narratives. No "savior" framing.
- Actions should be realistic, specific, and time-bounded.
- Keep total length under 400 words.
`;

  planOutput.textContent = "Generating...";
  planBtn.disabled = true;

  try {
    const result = await callOllama([
      { role: "system", content: SYSTEM_INSTRUCTIONS },
      { role: "user", content: planPrompt }
    ]);
    planOutput.textContent = result.trim();
  } catch (err) {
    console.error(err);
    planOutput.textContent =
      "There was an error generating the plan. Check that Ollama is running.";
  } finally {
    planBtn.disabled = false;
  }
});
