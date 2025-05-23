import { createUniver, defaultTheme, LocaleType, merge } from '@univerjs/presets';
import { UniverSheetsCorePreset } from '@univerjs/presets/preset-sheets-core';
import en from '@univerjs/presets/preset-sheets-core/locales/en-US';
import zh from '@univerjs/presets/preset-sheets-core/locales/zh-CN';

import './style.css';
import '@univerjs/presets/lib/styles/preset-sheets-core.css';

/* ----- 1.  Boot‑strap the grid  ---------------------------------- */
const { univerAPI } = createUniver({
  locale: LocaleType.EN_US,
  locales: { enUS: en, zhCN: zh },
  theme: defaultTheme,
  presets: [
    UniverSheetsCorePreset({ container: 'univer' }),  // << no formula field
  ],
});

univerAPI.createWorkbook({});

/* ----- 2.  Register the custom formula at runtime ---------------- */
const formulaEngine = univerAPI.getFormula();          // FFormula instance

const LYRICS = [
  "Cause darling I'm a nightmare dressed like a daydream",
  "We're happy, free, confused and lonely at the same time",
  "You call me up again just to break me like a promise",
  "I remember it all too well",
  "Loving him was red—burning red",
];

formulaEngine.registerFunction(
  'TAYLORSWIFT',                            // name to use in the sheet
  (i?: number) => {                         // executor
    if (i && i >= 1 && i <= LYRICS.length) return LYRICS[i - 1];
    return LYRICS[Math.floor(Math.random() * LYRICS.length)];
  },
  {
    description: 'customFunction.TAYLORSWIFT.description',
    locales: {
      enUS: { customFunction: { TAYLORSWIFT: { description: 'Returns a Taylor Swift lyric (optional 1‑5 selects specific line).' } } },
    },
  }
);
