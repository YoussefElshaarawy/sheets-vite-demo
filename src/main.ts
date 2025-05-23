import { createUniver, defaultTheme, LocaleType } from '@univerjs/presets';
import { UniverSheetsCorePreset } from '@univerjs/presets/preset-sheets-core';
import { UniverSheetsUIPreset }  from '@univerjs/presets/preset-sheets-ui';

import enUS from '@univerjs/presets/preset-sheets-core/locales/en-US';

import '@univerjs/presets/lib/styles/preset-sheets-core.css';
import '@univerjs/presets/lib/styles/preset-sheets-ui.css';   // toolbar & grid UI

/* 1. Boot‑strap Univer, adding UI painters first */
const { univerAPI } = createUniver({
  locale: LocaleType.EN_US,
  locales: { enUS },
  theme: defaultTheme,
  presets: [
    UniverSheetsUIPreset(),                       // draws toolbar/grid
    UniverSheetsCorePreset({ container: 'univer' }) // data + formulas
  ],
});

/* 2. Create a visible 100 × 100 sheet */
(univerAPI as any).createUniverSheet({
  name: 'Hello Univer',
  rowCount: 100,
  columnCount: 100,
});

/* 3. Register the TAYLORSWIFT() custom formula */
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
    const raw = Array.isArray(args[0]) ? args[0][0] : args[0];
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
            description: 'Returns a Taylor Swift lyric (1‑5 chooses a specific line).',
          },
        },
      },
    },
  }
);
