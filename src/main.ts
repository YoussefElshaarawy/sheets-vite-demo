import { createUniver, defaultTheme, LocaleType, merge } from '@univerjs/presets';
import { UniverSheetsCorePreset } from '@univerjs/presets/preset-sheets-core';
import UniverPresetSheetsCoreEnUS from '@univerjs/presets/preset-sheets-core/locales/en-US';
import UniverPresetSheetsCoreZhCN from '@univerjs/presets/preset-sheets-core/locales/zh-CN';

import './style.css';
import '@univerjs/presets/lib/styles/preset-sheets-core.css';

// 1. Initialize Univer
const { univerAPI } = createUniver({
  locale: LocaleType.EN_US,
  locales: {
    enUS: merge({}, UniverPresetSheetsCoreEnUS),
    zhCN: merge({}, UniverPresetSheetsCoreZhCN),
  },
  theme: defaultTheme,
  presets: [UniverSheetsCorePreset({ container: 'univer' })],
});

// 2. Create the sheet
univerAPI.createUniverSheet({ name: 'Hello Univer' });

// 3. Hooks & sheet reference
const sheetHooks = univerAPI.getSheetHooks();
const sheet = univerAPI.getCurrentWorkbook().getActiveSheet();

// 4. Playback map and selected‑cell tracker
const audioMap = new Map<string, HTMLAudioElement>();
let selectedCell: { row: number; col: number } | null = null;

// 5. Draw ▶️/⏸️ icons
sheetHooks.onCellRender([
  {
    drawWith: (ctx, info) => {
      const { row, col, primaryWithCoord: { startX, startY } } = info;
      const val = sheet.getCellValue(row, col);
      if (typeof val === 'string' && val.startsWith('audio:')) {
        const key = `${row},${col}`;
        const playing = audioMap.get(key)?.paused === false;
        ctx.font = '14px sans-serif';
        ctx.fillText(playing ? '⏸️' : '▶️', startX + 4, startY + 14);
      }
    },
  },
]);

// 6. Handle cell clicks: select cell & toggle audio
sheetHooks.onCellPointerClick(({ row, col }) => {
  selectedCell = { row, col };

  const val = sheet.getCellValue(row, col);
  if (typeof val === 'string' && val.startsWith('audio:')) {
    const url = val.slice('audio:'.length);
    const key = `${row},${col}`;
    let audio = audioMap.get(key);
    if (!audio) {
      audio = new Audio(url);
      audioMap.set(key, audio);
      audio.addEventListener('ended', () => sheet.reRender());
    }
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
    sheet.reRender();
  }
});

// 7. Add file‑input button
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = 'audio/*';
fileInput.style.position = 'absolute';
fileInput.style.top = '10px';
fileInput.style.right = '10px';
fileInput.style.zIndex = '1000';
document.body.appendChild(fileInput);

// 8. When a file is chosen, embed it into the selected cell
fileInput.addEventListener('change', () => {
  if (!selectedCell) return;
  const file = fileInput.files?.[0];
  if (file) {
    const url = URL.createObjectURL(file);
    const { row, col } = selectedCell;
    sheet.setCellValue(row, col, `audio:${url}`);
    sheet.reRender();
  }
});

// 9. Enable drag‑and‑drop onto the sheet container
const container = document.getElementById('univer')!;
container.addEventListener('dragover', (e) => e.preventDefault());
container.addEventListener('drop', (e) => {
  e.preventDefault();
  if (!selectedCell) return;
  const file = e.dataTransfer?.files[0];
  if (file?.type.startsWith('audio/')) {
    const url = URL.createObjectURL(file);
    const { row, col } = selectedCell;
    sheet.setCellValue(row, col, `audio:${url}`);
    sheet.reRender();
  }
});
