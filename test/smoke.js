// Minimal smoke test: ensure required element IDs exist in index.html
const fs = require('fs');
const assert = require('assert');

const html = fs.readFileSync('index.html', 'utf8');
const required = [
  'scenarioSelect',
  'userInput',
  'sendBtn',
  'chatOutput',
  'roleSelect',
  'contextInput',
  'planBtn',
  'planOutput'
];

for (const id of required) {
  assert(
    html.includes(`id="${id}"`),
    `Smoke test failed: missing element with id="${id}"`
  );
}

console.log('Smoke test passed: all required elements found.');
