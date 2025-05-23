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
      formula: {
        /** executor objects FIRST, string IDs SECOND */
        function: functionUser,
        description: FUNCTION_LIST_USER,
      },
    }),
  ],
});

univerAPI.createWorkbook({});
