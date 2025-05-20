import { createUniver, defaultTheme, LocaleType, merge } from '@univerjs/presets';
import { UniverSheetsCorePreset } from '@univerjs/presets/preset-sheets-core';
import UniverPresetSheetsCoreEnUS from '@univerjs/presets/preset-sheets-core/locales/en-US';
import UniverPresetSheetsCoreZhCN from '@univerjs/presets/preset-sheets-core/locales/zh-CN';

import './style.css';
import '@univerjs/presets/lib/styles/preset-sheets-core.css';

// 1) Initialise UniverJS in the <div id="univer">
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

// 2) Get sheet reference & hooks
const sheet = univerAPI.getCurrentWorkbook().getActiveSheet();
const hooks = univerAPI.getSheetHooks();

// 3) Audio‑in‑cell logic (play/pause icons & click handlers)
const audioMap = new Map<string, HTMLAudioElement>();
let selectedCell: { row: number; col: number } | null = null;

// draw ▶️/⏸️
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

// click→select cell + toggle audio
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
const dropZone = document.getElementById('drop-zone')!;

// open file picker
uploadBtn.addEventListener('click', () => fileInput.click());

// when file picked
fileInput.addEventListener('change', () => {
  if (!selectedCell) return;
  const file = fileInput.files?.[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  sheet.setCellValue(selectedCell.row, selectedCell.col, `audio:${url}`);
  sheet.reRender();
  fileInput.value = '';
});

// drag & drop
dropZone.addEventListener('dragover', e => e.preventDefault());
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  if (!selectedCell) return;
  const file = e.dataTransfer?.files[0];
  if (file?.type.startsWith('audio/')) {
    const url = URL.createObjectURL(file);
    sheet.setCellValue(selectedCell.row, selectedCell.col, `audio:${url}`);
    sheet.reRender();
  }
});
