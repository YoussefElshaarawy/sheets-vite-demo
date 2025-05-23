import { createUniver, defaultTheme, LocaleType, merge } from '@univerjs/presets';
import { UniverSheetsCorePreset } from '@univerjs/presets/preset-sheets-core';
import enUS from '@univerjs/presets/preset-sheets-core/locales/en-US';
import zhCN from '@univerjs/presets/preset-sheets-core/locales/zh-CN';
import { FUNCTION_LIST_USER, functionEnUS, functionUser } from './custom-function';

import './style.css';
import '@univerjs/presets/lib/styles/preset-sheets-core.css';

const { univerAPI } = createUniver({
  locale: LocaleType.EN_US,
  locales: {
    enUS: merge({}, enUS, functionEnUS),
    zhCN,
  },
  theme: defaultTheme,
  presets: [
  UniverSheetsCorePreset({
    container: 'univer',
    formula: {
      // 1) executor objects
      function: functionUser as any,       // cast silences TS mismatch
      // 2) IDs for Insert‑Function dialog
      description: FUNCTION_LIST_USER,     // string[]
    },
  }),
],

univerAPI.createWorkbook({});
