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

// ① Import the LLM pipeline helper and UUID generator
import { llmPipeline } from './llm';
import { v4 as uuid } from 'uuid';

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
/* 2.  Create a visible 100 × 100 sheet (cast → any silences TS)        */
/* ------------------------------------------------------------------ */
;(univerAPI as any).createUniverSheet({
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

;(univerAPI.getFormula() as any).registerFunction(
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
              'Returns a Taylor Swift lyric (optional 1‑5 chooses a specific line).',
          },
        },
      },
    },
  }
);

/* ------------------------------------------------------------------ */
/* 4.  Helper to write back into the calling cell                     */
/* ------------------------------------------------------------------ */
function writeToCell(a1: string, text: string) {
  univerAPI.getActiveWorkbook()
           .getActiveSheet()
           .getRange(a1)
           .setValue(text);
}

/* ------------------------------------------------------------------ */
/* 5.  Register the AI() custom formula                              */
/* ------------------------------------------------------------------ */
;(univerAPI.getFormula() as any).registerFunction(
  'AI',
  (prompt: any, optRange?: any) => {
    // 5·1 Flatten inputs like TAYLORSWIFT()
    const userPrompt = Array.isArray(prompt)
      ? prompt.flat().join(' ')
      : String(prompt);
    const context = optRange
      ? (Array.isArray(optRange) ? optRange.flat().join(' ') : String(optRange))
      : '';

    // 5·2 Find the address of the cell that called AI()
    const caller = univerAPI.getActiveWorkbook()
                  .getActiveSheet()
                  .getSelections()[0]
                  .getAddress();

    // 5·3 Give immediate feedback
    writeToCell(caller, 'Generating…');

    // 5·4 Background streaming from SmolLM2
    (async () => {
      // a) Ensure pipeline is loaded
      const generator = await llmPipeline;
      // b) Call with streaming enabled
      const stream = await generator(
        [
          { role: 'system', content: 'You are a helpful assistant.' },
          {
            role: 'user',
            content: context
              ? `${userPrompt}\n\nContext:\n${context}`
              : userPrompt,
          },
        ],
        { stream: true, max_new_tokens: 128, temperature: 0.2, top_p: 0.9, details: true }
      );

      // c) Accumulate tokens
      let output = '';
      for await (const chunk of stream) {
        output += chunk.generated_text ?? chunk.token?.text ?? '';
      }

      // d) Overwrite cell with final answer
      writeToCell(caller, output.trim());
    })();

    // 5·5 Return the immediate placeholder
    return 'Generating…';
  },
  {
    description: 'customFunction.AI.description',
    locales: {
      enUS: {
        customFunction: {
          AI: {
            description: 'Runs SmolLM 2 locally (WebGPU/WASM). =AI("Prompt" [, A1:B5])',
          },
        },
      },
    },
  }
);
