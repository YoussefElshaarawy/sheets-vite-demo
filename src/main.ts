import { createUniver, defaultTheme, LocaleType, merge } from '@univerjs/presets';
import { UniverSheetsCorePreset } from '@univerjs/presets/preset-sheets-core';
import UniverPresetSheetsCoreEnUS from '@univerjs/presets/preset-sheets-core/locales/en-US';
import UniverPresetSheetsCoreZhCN from '@univerjs/presets/preset-sheets-core/locales/zh-CN';

import './style.css';
import '@univerjs/presets/lib/styles/preset-sheets-core.css';

// 1. Initialise Univer
const { univerAPI } = createUniver({
  locale: LocaleType.EN_US,
  locales: {
    enUS: merge({}, UniverPresetSheetsCoreEnUS),
    zhCN: merge({}, UniverPresetSheetsCoreZhCN),
  },
  theme: defaultTheme,
  presets: [
    UniverSheetsCorePreset({ container: 'univer' }),
  ],
});

// 2. Create your sheet
univerAPI.createUniverSheet({ name: 'Hello Univer' });

// 3. Grab hooks & sheet reference
const sheetHooks = univerAPI.getSheetHooks();
const sheet = univerAPI.getCurrentWorkbook().getActiveSheet();

// Map to keep one HTMLAudioElement per cell
const audioMap = new Map<string, HTMLAudioElement>();

// 4. Draw ▶️ or ⏸️ in cells whose text starts with "audio:"
sheetHooks.onCellRender([{
  drawWith: (ctx, info) => {
    const { row, col, primaryWithCoord: { startX, startY } } = info;
    const val = sheet.getCellValue(row, col);
    if (typeof val === 'string' && val.startsWith('audio:')) {
      const key = `${row},${col}`;
      const isPlaying = audioMap.get(key)?.paused === false;
      // draw play or pause icon
      ctx.font = '14px sans-serif';
      ctx.fillText(isPlaying ? '⏸️' : '▶️', startX + 4, startY + 14);
    }
  },
}]);

// 5. Toggle play/pause when the cell is clicked
sheetHooks.onCellPointerClick(({ row, col }) => {
  const val = sheet.getCellValue(row, col);
  if (typeof val === 'string' && val.startsWith('audio:')) {
    const url = val.slice('audio:'.length);
    const key = `${row},${col}`;
    let audio = audioMap.get(key);
    if (!audio) {
      audio = new Audio(url);
      audioMap.set(key, audio);
      // when playback ends, re‑render so icon resets
      audio.addEventListener('ended', () => sheet.reRender());
    }
    // toggle
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
    // re‑draw the sheet immediately
    sheet.reRender();
  }
});
