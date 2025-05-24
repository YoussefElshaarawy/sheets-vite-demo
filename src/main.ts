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
/* 1.  Boot‑strap Univer and mount inside <div id="univer">            */
/* ------------------------------------------------------------------ */
const { univerAPI } = createUniver({
  locale: LocaleType.EN_US,
  locales: { enUS: merge({}, enUS), zhCN: merge({}, zhCN) },
  theme: defaultTheme,
  presets: [UniverSheetsCorePreset({ container: 'univer' })],
});

/* ------------------------------------------------------------------ */
/* 2.  Create a visible 100 × 100 sheet (cast → any silences TS)       */
/* ------------------------------------------------------------------ */
(univerAPI as any).createUniverSheet({
  name: 'Hello Univer',
  rowCount: 100,
  columnCount: 100,
});

/* ------------------------------------------------------------------ */
/* 3.  Register the TAYLORSWIFT() custom formula                      */
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
    const idx   = Number(value);
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
              'Returns a Taylor Swift lyric (optional 1‑5 chooses a specific line).',
          },
        },
      },
    },
  }
);
/* 4. Inject “Load LLM Model” & “Generate LLM” buttons + status bar */
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
});
document.body.appendChild(loadBtn);

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
});
genBtn.disabled = true;
document.body.appendChild(genBtn);

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
});
document.body.appendChild(statusBar);


/* 5. Bootstrap the exact same worker.js you wrote for React */
const worker = new Worker(new URL('./worker.js', import.meta.url), {
  type: 'module',
});
worker.postMessage({ type: 'check' }); // feature‐detect WebGPU

// Message dispatcher: mirror every status into our statusBar (and buttons)
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
      statusBar.textContent = `Loading ${msg.file}: ${(
        (msg.progress / msg.total) *
        100
      ).toFixed(1)}%`;
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
      // stream token‐by‐token into the active cell
      {
        const { output } = msg;
        // 📌 Replace these two lines with your UniverJS API:
        //    read current cell, append `output`, write back.
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

// wire up the “Load LLM Model” button
loadBtn.addEventListener('click', () => {
  loadBtn.disabled = true;
  loadBtn.style.opacity = '0.5';
  worker.postMessage({ type: 'load' });
});

// wire up the “Generate LLM” button
genBtn.addEventListener('click', () => {
  // 1) Grab the text of the currently selected cell
  const sheet = (univerAPI as any)
    .getWorkBook()
    .getActiveSheetInstance();
  const { row, column } = sheet.getActiveCellPosition();
  const prompt = sheet.getRange(row, column).getValue() as string;

  if (!prompt || prompt.trim().length === 0) {
    alert('Please enter a prompt into the selected cell first.');
    return;
  }

  // 2) Clear out that cell, enable streaming
  sheet.getRange(row, column).setValue('');
  worker.postMessage({ type: 'generate', data: [{ role: 'user', content: prompt }] });
});

