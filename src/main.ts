import { createUniver, defaultTheme, LocaleType, merge } from '@univerjs/presets';
import { UniverSheetsCorePreset } from '@univerjs/presets/preset-sheets-core';
import UniverPresetSheetsCoreEnUS from '@univerjs/presets/preset-sheets-core/locales/en-US';
import UniverPresetSheetsCoreZhCN from '@univerjs/presets/preset-sheets-core/locales/zh-CN';

import { FUNCTION_LIST_USER, functionEnUS, functionUser } from './custom-function';

import './style.css';
import '@univerjs/presets/lib/styles/preset-sheets-core.css';

/* ------------------------------------------------------------------ */
/* 1.  Boot‑strap Univer                                              */
/* ------------------------------------------------------------------ */
const { univerAPI } = createUniver({
  locale: LocaleType.EN_US,
  locales: {
    // merge built‑in EN‑US + your custom tooltip strings
    enUS: merge({}, UniverPresetSheetsCoreEnUS, functionEnUS),
    zhCN: merge({}, UniverPresetSheetsCoreZhCN),
  },
  theme: defaultTheme,
  presets: [
    /* -------------------------------------------------------------- */
    /* Sheets core + your custom formula catalogue                    */
    /* -------------------------------------------------------------- */
    UniverSheetsCorePreset({
      container: 'univer',           // <div id="univer"></div> in index.html
      formula: {
        function: functionUser,      // executor array (TAYLORSWIFT)
        description: FUNCTION_LIST_USER, // IDs for Insert‑Function dialog
      },
    }),
  ],
});

/* ------------------------------------------------------------------ */
/* 2.  Launch a workbook (or createUniverSheet if you prefer)         */
/* ------------------------------------------------------------------ */
univerAPI.createWorkbook({});
