import { createUniver, defaultTheme, LocaleType } from '@univerjs/presets';
import { UniverSheetsCorePreset }               from '@univerjs/presets/preset-sheets-core';
import enUS                                     from '@univerjs/presets/preset-sheets-core/locales/en-US';
import '@univerjs/presets/lib/styles/preset-sheets-core.css';

/* 1. Boot‑strap Univer and mount it in <div id="univer"> */
const { univerAPI } = createUniver({
  locale: LocaleType.EN_US,
  locales: { enUS },
  theme: defaultTheme,
  presets: [UniverSheetsCorePreset({ container: 'univer' })],
});
univerAPI.createUniverSheet({ name: 'Hello Univer' });

/* 2. Register the TAYLORSWIFT() custom formula */
const LYRICS = [
  "Cause darling I'm a nightmare dressed like a daydream",
  "We're happy, free, confused and lonely at the same time",
  "You call me up again just to break me like a promise",
  "I remember it all too well",
  "Loving him was red—burning red",
];
