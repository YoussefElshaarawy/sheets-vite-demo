import { createUniver, defaultTheme, LocaleType } from '@univerjs/presets';
import { UniverSheetsCorePreset }               from '@univerjs/presets/preset-sheets-core';
import enUS                                     from '@univerjs/presets/preset-sheets-core/locales/en-US';

import '@univerjs/presets/lib/styles/preset-sheets-core.css';

/* ------------------------------------------------------------------ */
/* 1.  Boot‑strap Univer (no formula field needed)                     */
/* ------------------------------------------------------------------ */
const { univerAPI } = createUniver({
  locale: LocaleType.EN_US,
  locales: { enUS },
  theme: defaultTheme,
  presets: [UniverSheetsCorePreset({ container: 'univer' })],
});
univerAPI.createWorkbook({});
/* ------------------------------------------------------------------ */
/* 2.  Register the TAYLORSWIFT() custom function at runtime          */
/* ------------------------------------------------------------------ */
const formulaEngine = univerAPI.getFormula();

const LYRICS = [
  "Cause darling I'm a nightmare dressed like a daydream",
  "We're happy, free, confused and lonely at the same time",
  "You call me up again just to break me like a promise",
  "I remember it all too well",
  "Loving him was red—burning red",
];

// executor typed loosely to satisfy the current .d.ts
formulaEngine.registerFunction(
  'TAYLORSWIFT',
  (...args: any[]) => {
    const raw = Array.isArray(args[0]) ? args[0][0] : args[0];   // core‑1: value
    const idx = Number(raw);
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
              'Returns a Taylor Swift lyric. Pass 1‑5 to pick a specific line.',
          },
        },
      },
    },
  }
);
