/* ------------------------------------------------------------------ */
/*  main.ts – fully working example with AUDIO() cells                 */
/* ------------------------------------------------------------------ */

import {
  createUniver,
  defaultTheme,
  LocaleType,
  merge,
} from '@univerjs/presets';
import { UniverSheetsCorePreset } from '@univerjs/presets/preset-sheets-core';
import enUS from '@univerjs/presets/preset-sheets-core/locales/en-US';
import zhCN from '@univerjs/presets/preset-sheets-core/locales/zh-CN';

import { AudioCellPlugin } from './AudioCellPlugin';      // NEW – our renderer

import './style.css';
import '@univerjs/presets/lib/styles/preset-sheets-core.css';

/* ------------------------------------------------------------------ */
/* 1.  Boot‑strap Univer and mount inside <div id="univer">            */
/* ------------------------------------------------------------------ */
const { univerAPI, univer } = createUniver({
  locale: LocaleType.EN_US,
  locales: { enUS: merge({}, enUS), zhCN: merge({}, zhCN) },
  theme: defaultTheme,
  presets: [UniverSheetsCorePreset({ container: 'univer' })],
});

/* Register the audio‑cell renderer                                   */
univer.registerPlugin(new AudioCellPlugin());

/* ------------------------------------------------------------------ */
/* 2.  Create a visible 100 × 100 sheet                                */
/* ------------------------------------------------------------------ */
(univerAPI as any).createUniverSheet({
  name: 'Hello Univer',
  rowCount: 100,
  columnCount: 100,
});

/* ------------------------------------------------------------------ */
/* 3.  Register custom formulae                                       */
/* ------------------------------------------------------------------ */

/* 3‑a  TAYLORSWIFT() – unchanged                                     */
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
              'Returns a Taylor Swift lyric (optional 1‑5 chooses a specific line).',
          },
        },
      },
    },
  }
);

/* 3‑b  AUDIO(url) – returns an object that AudioCellPlugin can render */
(univerAPI.getFormula() as any).registerFunction(
  'AUDIO',
  (url: string) => ({ __type: 'audio', src: url }),
  {
    description: 'Embeds an HTML‑audio player for a direct MP3/OGG/WAV link.',
    locales: {
      enUS: {
        customFunction: {
          AUDIO: {
            description: 'Embeds a playable audio clip from the supplied URL.',
          },
        },
      },
    },
  }
);
