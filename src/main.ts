import { createUniver, defaultTheme, LocaleType, merge } from '@univerjs/presets';
import { UniverSheetsCorePreset } from '@univerjs/presets/preset-sheets-core';
import UniverPresetSheetsCoreEnUS from '@univerjs/presets/preset-sheets-core/locales/en-US';
import UniverPresetSheetsCoreZhCN from '@univerjs/presets/preset-sheets-core/locales/zh-CN';

import './style.css';
import '@univerjs/presets/lib/styles/preset-sheets-core.css';

// 1) Initialise UniverJS into the <div id="univer">
const { univerAPI } = createUniver({
  locale: LocaleType.EN_US,
  locales: {
    enUS: merge({}, UniverPresetSheetsCoreEnUS),
    zhCN: merge({}, UniverPresetSheetsCoreZhCN),
  },
  theme: defaultTheme,
  presets: [UniverSheetsCorePreset({ container: 'univer' })],
});
univerAPI.createUniverSheet({ name: 'Hello Univer' });

// 2) Grab sheet & hooks
const sheet = univerAPI.getActiveWorkbook()!.getActiveSheet!();
const hooks = univerAPI.getSheetHooks!();

// 3) Audio logic
const audioMap = new Map<string, HTMLAudioElement>();
let selectedCell: { row: number; col: number } | null = null;

// Draw ▶️/⏸️ icons in any cell whose value starts with "audio:"
hooks.onCellRender([{
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
}]);

// When you click a cell, keep track of it & toggle play/pause
hooks.onCellPointerClick(({ row, col }) => {
  selectedCell = { row, col };
  const val = sheet.getCellValue(row, col);
  if (typeof val === 'string' && val.startsWith('audio:')) {
    const key = `${row},${col}`;
    let audio = audioMap.get(key);
    if (!audio) {
      audio = new Audio(val.slice(6));
      audioMap.set(key, audio);
      audio.addEventListener('ended', () => sheet.reRender());
    }
    audio.paused ? audio.play() : audio.pause();
    sheet.reRender();
  }
});

// 4) Wire up your upload button & drop‑zone
const uploadBtn = document.getElementById('upload-btn') as HTMLButtonElement;
const fileInput = document.getElementById('audio-input') as HTMLInputElement;
const dropZone  = document.getElementById('drop-zone')!;

// Open file picker
uploadBtn.addEventListener('click', () => fileInput.click());

// When a file is picked, insert its blob‑URL into the selected cell
fileInput.addEventListener('change', () => {
  if (!selectedCell) return;
  const file = fileInput.files?.[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  sheet.setCellValue(selectedCell.row, selectedCell.col, `audio:${url}`);
  sheet.reRender();
  fileInput.value = '';
});

// Support drag‑and‑drop
dropZone.addEventListener('dragover', e => e.preventDefault());
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  if (!selectedCell) return;
  const f = e.dataTransfer?.files[0];
  if (f?.type.startsWith('audio/')) {
    const url = URL.createObjectURL(f);
    sheet.setCellValue(selectedCell.row, selectedCell.col, `audio:${url}`);
    sheet.reRender();
  }
});
