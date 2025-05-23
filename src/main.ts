import { createUniver, defaultTheme, LocaleType, merge } from '@univerjs/presets';
import { UniverSheetsCorePreset } from '@univerjs/presets/preset-sheets-core';
import enUS from '@univerjs/presets/preset-sheets-core/locales/en-US';
import zhCN from '@univerjs/presets/preset-sheets-core/locales/zh-CN';

import './style.css';
import '@univerjs/presets/lib/styles/preset-sheets-core.css';

// ① Import the Xenova Transformers.js pipeline
// ① Import the Hugging Face Transformers JS pipeline
import { pipeline } from '@huggingface/transformers';

// ② Prepare the LLM pipeline once (returns a Promise of generator)
const llmPipeline = pipeline(
  'text-generation',
  'HuggingFaceTB/SmolLM2-1.7B-Instruct'
);

// ③ Boot‑strap Univer and mount inside <div id="univer">
const { univerAPI } = createUniver({
  locale: LocaleType.EN_US,
  locales: { enUS: merge({}, enUS), zhCN: merge({}, zhCN) },
  theme: defaultTheme,
  presets: [UniverSheetsCorePreset({ container: 'univer' })],
});

// ④ Create a visible 100×100 sheet
;(univerAPI as any).createUniverSheet({
  name: 'Hello Univer',
  rowCount: 100,
  columnCount: 100,
});

// ⑤ Register the TAYLORSWIFT() custom formula unchanged
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

// ⑥ Helper to overwrite any A1‑style cell address
function writeToCell(a1: string, text: string) {
  const sheet = univerAPI.getActiveWorkbook()!.getActiveSheet()!;
  sheet.getRange(a1).setValue(text);
}

// ⑦ Register the AI() custom formula that returns a placeholder immediately
;(univerAPI.getFormula() as any).registerFunction(
  'AI',
  (prompt: any, optRange?: any) => {
    // Flatten inputs like TAYLORSWIFT()
    const userPrompt = Array.isArray(prompt)
      ? prompt.flat().join(' ')
      : String(prompt);
    const context = optRange
      ? (Array.isArray(optRange)
          ? optRange.flat().join(' ')
          : String(optRange))
      : '';

    // Determine which cell called AI()
    const caller = univerAPI.getActiveWorkbook()!.getActiveSheet()!.getActiveCell().getAddress();

    // Immediate placeholder so the formula engine never hangs
    writeToCell(caller, 'Generating…');

    // Background generation using Transformers.js
    (async () => {
      const generator = await llmPipeline;
      const result = await generator(
        context
          ? `${userPrompt}\n\nContext:\n${context}`
          : userPrompt,
        { max_new_tokens: 128, temperature: 0.2, top_p: 0.9 }
      );

      // Extract text from the pipeline output
      const answer = Array.isArray(result)
        ? (result[0] as any).generated_text || String(result[0])
        : String(result);

      writeToCell(caller, answer.trim());
    })();

    // Return immediate placeholder
    return 'Generating…';
  },
  {
    description: 'customFunction.AI.description',
    locales: {
      enUS: {
        customFunction: {
          AI: {
            description:
              'Runs SmolLM 2 locally via Transformers.js. =AI("Prompt" [, A1:B5])',
          },
        },
      },
    },
  }
);
