import { createUniver, defaultTheme, LocaleType, merge } from '@univerjs/presets';
import { UniverSheetsCorePreset } from '@univerjs/presets/preset-sheets-core';
import coreEnUS from '@univerjs/presets/preset-sheets-core/locales/en-US';
import coreZhCN from '@univerjs/presets/preset-sheets-core/locales/zh-CN';

import { FUNCTION_LIST_USER, functionEnUS, functionUser } from './custom-function';

import './style.css';
import '@univerjs/presets/lib/styles/preset-sheets-core.css';

const { univerAPI } = createUniver({
  locale: LocaleType.EN_US,
  locales: {
    enUS: merge({}, coreEnUS, functionEnUS),
    zhCN: coreZhCN,
  },
  theme: defaultTheme,
  presets: [
    UniverSheetsCorePreset({
      container: 'univer',

      // ------------- custom formula catalogue ----------------
      formula: {
        function: functionUser as any,      // executor array; cast silences bad .d.ts
        description: FUNCTION_LIST_USER,    // string IDs for Insert‑Function dialog
      },
    }),
  ],
});

univerAPI.createWorkbook({});
