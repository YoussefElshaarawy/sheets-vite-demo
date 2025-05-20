import { createUniver, defaultTheme, LocaleType, merge } from '@univerjs/presets';
import { UniverSheetsCorePreset } from '@univerjs/presets/preset-sheets-core';
import UniverPresetSheetsCoreEnUS from '@univerjs/presets/preset-sheets-core/locales/en-US';
import UniverPresetSheetsCoreZhCN from '@univerjs/presets/preset-sheets-core/locales/zh-CN';

import './style.css';
import '@univerjs/presets/lib/styles/preset-sheets-core.css';

// 1) Initialise UniverJS into the <div id="sheet-wrapper">
const { univerAPI } = createUniver({
  locale: LocaleType.EN_US,
  locales: {
    enUS: merge({}, UniverPresetSheetsCoreEnUS),
    zhCN: merge({}, UniverPresetSheetsCoreZhCN),
  },
  theme: defaultTheme,
  presets: [
    UniverSheetsCorePreset({ container: 'sheet-wrapper' }),
  ],
});
univerAPI.createUniverSheet({ name: 'Hello Univer' });

// 2) Grab the new Facade APIs
const workbook = univerAPI.getActiveWorkbook();            // ← correct API!
const sheet = workbook.getActiveSheet();
const hooks = univerAPI.getSheetHooks();

// 3) Audio‑in‑cell logic state
const audioMap = new Map<string, HTMLAudioElement>();
let selectedCell: { row: number; col: number } | null = null;

// 4) Draw ▶️/⏸️ icon in any cell whose value starts with "audio:"
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

// 5) Use the new facade event instead of the old hook
workbook.addEvent('CellClicked', (evt: any) => {
  const { row, col } = evt;  // evt.row and evt.col come from the event payload
  selectedCell = { row, col };

  // If this cell holds an audio: URL, toggle play/pause
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

// 6) Wire up your upload button & drop‑zone (these live in your injected HTML)
const uploadBtn = document.getElementById('upload-btn') as HTMLButtonElement;
const fileInput = document.getElementById('audio-input') as HTMLInputElement;
const dropZone  = document.getElementById('drop-zone')!;

// Open the file picker
uploadBtn.addEventListener('click', () => fileInput.click());

// When a file is selected, insert it into the last‑clicked cell
fileInput.addEventListener('change', () => {
  if (!selectedCell) return;
  const file = fileInput.files?.[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  sheet.setCellValue(selectedCell.row, selectedCell.col, `audio:${url}`);
  sheet.reRender();
  fileInput.value = '';
});

// Drag & drop directly onto your sidebar’s drop‑zone
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
