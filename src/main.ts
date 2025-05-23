import { createUniver, defaultTheme, LocaleType } from '@univerjs/presets';
import { UniverSheetsCorePreset } from '@univerjs/presets/preset-sheets-core';
import { UniverSheetsUIPreset  }  from '@univerjs/presets/preset-sheets-ui';
import enUS from '@univerjs/presets/preset-sheets-core/locales/en-US';
import '@univerjs/presets/lib/styles/preset-sheets-core.css';

/* boot‑strap with core + UI */
const { univerAPI } = createUniver({
  locale: LocaleType.EN_US,
  locales: { enUS },
  theme: defaultTheme,
  presets: [
    UniverSheetsUIPreset(),                       // ✅ painters
    UniverSheetsCorePreset({ container: 'univer' })
  ],
});

/* desks: 100 × 100 */
(univerAPI as any).createUniverSheet({
  name: 'Hello Univer',
  rowCount: 100,
  columnCount: 100,
});

/* spell: TAYLORSWIFT */
const LYRICS = [
  "Cause darling I'm a nightmare dressed like a daydream",
  "We're happy, free, confused and lonely at the same time",
  "You call me up again just to break me like a promise",
  "I remember it all too well",
  "Loving him was red—burning red",
];

const swiftExecutor = (...args: any[]) => {
  const raw = Array.isArray(args[0]) ? args[0][0] : args[0];
  const idx = Number(raw);
  return idx >= 1 && idx <= LYRICS.length
    ? LYRICS[idx - 1]
    : LYRICS[Math.floor(Math.random() * LYRICS.length)];
};

(univerAPI.getFormula() as any).registerFunction('TAYLORSWIFT', swiftExecutor, {
  description: 'customFunction.TAYLORSWIFT.description',
  locales: {
    enUS: {
      customFunction: {
        TAYLORSWIFT: {
          description: 'Returns a Taylor Swift lyric (1‑5 chooses specific line).',
        },
      },
    },
  },
});
