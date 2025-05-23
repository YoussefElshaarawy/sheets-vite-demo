import { createUniver, defaultTheme, LocaleType, merge } from '@univerjs/presets';
import { UniverSheetsCorePreset } from '@univerjs/presets/preset-sheets-core';
import enUS from '@univerjs/presets/preset-sheets-core/locales/en-US';
import zhCN from '@univerjs/presets/preset-sheets-core/locales/zh-CN';

import './style.css';
import '@univerjs/presets/lib/styles/preset-sheets-core.css';

// ① Import the ONNX pipeline from Transformers.js
import { pipeline } from '@xenova/transformers';

// ② Prepare the LLM pipeline configuration (local ONNX files)
// ② Prepare the LLM pipeline configuration using local ONNX paths
//    The second argument must be a string path to the ONNX model file
const llmPipeline = pipeline(
  'text-generation',
  '/onnx/model_q4f16.onnx',             // ONNX model file URL
  { tokenizer: '/onnx/tokenizer.json',  // Optional tokenizer file URL
    backend: 'onnx' }
);

// ③ Boot‑strap Univer and mount inside <div id="univer">
const { univerAPI } = createUniver({
  locale: LocaleType.EN_US,
  locales: { enUS: merge({}, enUS), zhCN: merge({}, zhCN) },
  theme: defaultTheme,
  presets: [UniverSheetsCorePreset({ container: 'univer' })],
});

// ④ Create a visible 100×100 sheet
;(univerAPI as any).createUniverSheet({ name: 'Hello Univer', rowCount: 100, columnCount: 100 });

// ⑤ Insert a "Load Model" button and progress bar
const container = document.getElementById('univer')!;
const loadBtn = document.createElement('button');
loadBtn.textContent = 'Load SmolLM2 Model';
loadBtn.style.margin = '10px';
const progressBar = document.createElement('progress');
progressBar.max = 100;
progressBar.value = 0;
progressBar.style.display = 'none';
progressBar.style.width = '200px';
container.prepend(progressBar);
container.prepend(loadBtn);

// ⑥ Override fetch to track ONNX downloads
const originalFetch = window.fetch.bind(window);
window.fetch = async (input, init) => {
  const url = typeof input === 'string' ? input : (input as Request).url;
  if (url.endsWith('.onnx')) {
    loadBtn.disabled = true;
    progressBar.style.display = 'block';
    const res = await originalFetch(input, init);
    if (!res.ok || !res.body) return res;
    const total = Number(res.headers.get('Content-Length') || 0);
    const reader = res.body.getReader();
    let loaded = 0;
    const stream = new ReadableStream({
      start(controller) {
        function pump() {
          reader.read().then(({ done, value }) => {
            if (done) {
              controller.close();
              progressBar.value = 100;
              loadBtn.textContent = 'Model Loaded';
              return;
            }
            if (value) {
              loaded += value.byteLength;
              if (total) progressBar.value = (loaded / total) * 100;
              controller.enqueue(value);
            }
            pump();
          });
        }
        pump();
      }
    });
    return new Response(stream, { headers: res.headers });
  }
  return originalFetch(input, init);
};

// ⑦ Button click triggers pipeline instantiation
loadBtn.addEventListener('click', async () => {
  loadBtn.textContent = 'Loading...';
  await llmPipeline;  // triggers ONNX fetch and progress
});

// ⑧ Register the TAYLORSWIFT() custom formula unchanged
const LYRICS = [
  "Cause darling I'm a nightmare dressed like a daydream",
  "We're happy, free, confused and lonely at the same time",
  "You call me up again just to break me like a promise",
  "I remember it all too well",
  "Loving him was red—burning red",
];

;(univerAPI.getFormula() as any).registerFunction(
  'TAYLORSWIFT',
  (...args: any[]) => {
    const value = Array.isArray(args[0]) ? args[0][0] : args[0];
    const idx = Number(value);
    return idx >= 1 && idx <= LYRICS.length ? LYRICS[idx - 1] : LYRICS[Math.floor(Math.random() * LYRICS.length)];
  },
  { description: 'customFunction.TAYLORSWIFT.description' }
);

// ⑨ Register AI() as an async formula
;(univerAPI.getFormula() as any).registerAsyncFunction(
  'AI',
  async (prompt: any, optRange?: any) => {
    // Flatten inputs like TAYLORSWIFT()
    const userPrompt = Array.isArray(prompt) ? prompt.flat().join(' ') : String(prompt);
    const context = optRange ? (Array.isArray(optRange) ? optRange.flat().join(' ') : String(optRange)) : '';
    const messages = [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: context ? `${userPrompt}\n\nContext:\n${context}` : userPrompt },
    ];
    // Await pipeline (ONNX model must be loaded via Load Model button first)
    const generator = await llmPipeline;
    const result = await generator(messages, { max_new_tokens: 128, temperature: 0.2, top_p: 0.9 });
    const answer = Array.isArray(result) ? (result[0] as any).generated_text || String(result[0]) : String(result);
    return answer.trim();
  },
  { description: 'customFunction.AI.description' }
);
