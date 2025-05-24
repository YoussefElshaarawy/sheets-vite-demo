import {
  createUniver,
  defaultTheme,
  LocaleType,
  merge,
} from '@univerjs/presets';
import { UniverSheetsCorePreset } from '@univerjs/presets/preset-sheets-core';
import enUS from '@univerjs/presets/preset-sheets-core/locales/en-US';
import zhCN from '@univerjs/presets/preset-sheets-core/locales/zh-CN';

import './style.css';
import '@univerjs/presets/lib/styles/preset-sheets-core.css';

/* ------------------------------------------------------------------ */
/* 1.  Boot-strap Univer and mount inside <div id="univer">            */
/* ------------------------------------------------------------------ */
const { univerAPI } = createUniver({
  locale: LocaleType.EN_US,
  locales: { enUS: merge({}, enUS), zhCN: merge({}, zhCN) },
  theme: defaultTheme,
  presets: [UniverSheetsCorePreset({ container: 'univer' })],
});

/* ------------------------------------------------------------------ */
/* 2.  Create a visible 100 × 100 sheet                                */
/* ------------------------------------------------------------------ */
(univerAPI as any).createUniverSheet({
  name: 'Hello Univer',
  rowCount: 100,
  columnCount: 100,
});

/* ------------------------------------------------------------------ */
/* 3.  Register TAYLORSWIFT()                                          */
/* ------------------------------------------------------------------ */
const LYRICS = [
  "Cause darling I'm a nightmare dressed like a daydream",
  "We're happy, free, confused and lonely at the same time",
  "You call me up again just to break me like a promise",
  "I remember it all too well",
  "Loving him was red—burning red",
];

(univerAPI.getFormula() as any).registerFunction(
  'TAYLORSWIFT',
  (...args: any[]) => {
    const value = Array.isArray(args[0]) ? args[0][0] : args[0];
    const idx = Number(value);
    return idx >= 1 && idx <= LYRICS.length
      ? LYRICS[idx - 1]
      : LYRICS[Math.floor(Math.random() * LYRICS.length)];
  },
  {
    description: 'customFunction.TAYLORSWIFT.description',
    locales: {
      enUS: {
        customFunction: {
          TAYLORSWIFT: {
            description:
              'Returns a Taylor Swift lyric (optional 1-5 chooses a specific line).',
          },
        },
      },
    },
  }
);

/* ------------------------------------------------------------------ */
/* 3b. Register SMOLLM() stub — queues your prompt (and optional range)*/
/* ------------------------------------------------------------------ */
;(window as any).__smolPromptMap = {};
(univerAPI.getFormula() as any).registerFunction(
  'SMOLLM',
  (promptArg: any, rangeArg?: any) => {
    // Flatten prompt
    const prompt =
      Array.isArray(promptArg) && Array.isArray(promptArg[0])
        ? promptArg[0][0]
        : promptArg;
    // Flatten optional range to a single string for “context”
    let context = '';
    if (rangeArg) {
      const rows = Array.isArray(rangeArg) ? rangeArg : [[rangeArg]];
      context = rows.flat().join(' ');
    }
    // Store it by cell position
    const sheet = (univerAPI as any)
      .getWorkBook()
      .getActiveSheetInstance();
    const { row, column } = sheet.getActiveCellPosition();
    (window as any).__smolPromptMap[`${row},${column}`] = { prompt, context };
    // Return a placeholder – you must click “Generate LLM” next
    return '⏳ Prompt queued – click Generate LLM';
  },
  {
    description: 'customFunction.SMOLLM.description',
    locales: {
      enUS: {
        customFunction: {
          SMOLLM: {
            description:
              'Queues a prompt (and optional context range) for SmolLM; then click the Generate LLM button to run.',
          },
        },
      },
    },
  }
);

/* ------------------------------------------------------------------ */
/* 4. Inject Load/Generate buttons + status into the Univer container */
/* ------------------------------------------------------------------ */
const container = document.getElementById('univer')!;
container.style.position = 'relative';

const loadBtn = document.createElement('button');
loadBtn.textContent = 'Load LLM Model';
Object.assign(loadBtn.style, {
  position: 'absolute',
  top: '10px',
  right: '10px',
  padding: '6px 12px',
  background: '#1d4ed8',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  zIndex: '10000',
});
container.appendChild(loadBtn);

const genBtn = document.createElement('button');
genBtn.textContent = 'Generate LLM';
Object.assign(genBtn.style, {
  position: 'absolute',
  top: '10px',
  right: '140px',
  padding: '6px 12px',
  background: '#047857',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  opacity: '0.5',
  zIndex: '10000',
});
genBtn.disabled = true;
container.appendChild(genBtn);

const statusBar = document.createElement('div');
statusBar.textContent = 'Model not loaded';
Object.assign(statusBar.style, {
  position: 'absolute',
  top: '50px',
  right: '10px',
  padding: '6px 12px',
  background: 'rgba(0,0,0,0.7)',
  color: 'white',
  borderRadius: '4px',
  zIndex: '10000',
});
container.appendChild(statusBar);

/* ------------------------------------------------------------------ */
/* 5. Spin up the same WebGPU worker.js you had in React             */
/* ------------------------------------------------------------------ */
const worker = new Worker(new URL('./worker.js', import.meta.url), {
  type: 'module',
});
worker.postMessage({ type: 'check' });

worker.addEventListener('message', (evt) => {
  const msg = evt.data as any;
  switch (msg.status) {
    case 'loading':
      statusBar.textContent = msg.data;
      break;
    case 'initiate':
      statusBar.textContent = `Loading ${msg.file}: 0%`;
      break;
    case 'progress':
      statusBar.textContent = `Loading ${msg.file}: ${((msg.progress / msg.total) * 100).toFixed(1)}%`;
      break;
    case 'done':
      statusBar.textContent = `Loaded ${msg.file}`;
      break;
    case 'ready':
      statusBar.textContent = '🟢 Model is ready';
      loadBtn.disabled = true;
      loadBtn.style.opacity = '0.5';
      genBtn.disabled = false;
      genBtn.style.opacity = '1';
      break;
    case 'error':
      statusBar.textContent = `❌ Error: ${msg.data}`;
      loadBtn.disabled = false;
      loadBtn.style.opacity = '1';
      break;
    case 'start':
      statusBar.textContent = 'Generating…';
      break;
    case 'update':
      {
        // Stream token by token back into the active cell
        const { output } = msg;
        const sheet = (univerAPI as any)
          .getWorkBook()
          .getActiveSheetInstance();
        const { row, column } = sheet.getActiveCellPosition();
        const prev = sheet.getRange(row, column).getValue() as string;
        sheet.getRange(row, column).setValue(prev + output);
      }
      break;
    case 'complete':
      statusBar.textContent = '✅ Generation complete';
      break;
  }
});

// Load button
loadBtn.addEventListener('click', () => {
  loadBtn.disabled = true;
  loadBtn.style.opacity = '0.5';
  worker.postMessage({ type: 'load' });
});

// Generate button
genBtn.addEventListener('click', () => {
  const sheet = (univerAPI as any)
    .getWorkBook()
    .getActiveSheetInstance();
  const { row, column } = sheet.getActiveCellPosition();
  const key = `${row},${column}`;
  const entry = (window as any).__smolPromptMap[key];
  if (!entry) {
    alert('No SMOLLM() prompt queued here – enter =SMOLLM("your prompt") first.');
    return;
  }
  // Clear and start streaming
  sheet.getRange(row, column).setValue('');
  worker.postMessage({
    type: 'generate',
    data: [{ role: 'user', content: entry.prompt + (entry.context ? `\nContext: ${entry.context}` : '') }],
  });
});
