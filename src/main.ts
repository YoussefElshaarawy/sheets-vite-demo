import { createUniver, defaultTheme, LocaleType, merge } from '@univerjs/presets';
import { UniverSheetsCorePreset } from '@univerjs/presets/preset-sheets-core';
import enUS from '@univerjs/presets/preset-sheets-core/locales/en-US';
import zhCN from '@univerjs/presets/preset-sheets-core/locales/zh-CN';

import './style.css';
import '@univerjs/presets/lib/styles/preset-sheets-core.css';

// mount into #univer (unchanged)
const { univerAPI } = createUniver({
  locale: LocaleType.EN_US,
  locales: { enUS: merge({}, enUS), zhCN: merge({}, zhCN) },
  theme: defaultTheme,
  presets: [UniverSheetsCorePreset({ container: 'univer' })],
});
univerAPI.createUniverSheet({ name: 'Hello Univer' });

const sheet = univerAPI.getActiveWorkbook()!.getActiveSheet!();
const hooks = univerAPI.getSheetHooks!();

/* in‑cell icons */
const audioMap = new Map<string, HTMLAudioElement>();
let selected: { row: number; col: number } | null = null;

hooks.onCellRender([{
  drawWith: (ctx, { row, col, primaryWithCoord }) => {
    const v = sheet.getCellValue(row, col);
    if (typeof v === 'string' && v.startsWith('audio:')) {
      const playing = audioMap.get(`${row},${col}`)?.paused === false;
      ctx.font = '14px sans-serif';
      ctx.fillText(playing ? '⏸️' : '▶️', primaryWithCoord.startX + 4, primaryWithCoord.startY + 14);
    }
  },
}]);

hooks.onCellPointerClick(({ row, col }) => {
  selected = { row, col };
  const v = sheet.getCellValue(row, col);
  if (typeof v === 'string' && v.startsWith('audio:')) {
    const key = `${row},${col}`;
    let a = audioMap.get(key);
    if (!a) {
      a = new Audio(v.slice(6));
      audioMap.set(key, a);
      a.addEventListener('ended', () => sheet.forceRender?.());
    }
    a.paused ? a.play() : a.pause();
    sheet.forceRender?.();
  }
});

/* upload / drop */
const uploadBtn = document.getElementById('upload-btn') as HTMLButtonElement;
const fileInput = document.getElementById('audio-input') as HTMLInputElement;
const dropZone  = document.getElementById('drop-zone') as HTMLElement;

uploadBtn.onclick = () => fileInput.click();
fileInput.onchange = () => { if (fileInput.files?.[0]) insert(fileInput.files[0]); fileInput.value=''; };
dropZone.ondragover = e => e.preventDefault();
dropZone.ondrop = e => { e.preventDefault(); if (e.dataTransfer?.files[0]) insert(e.dataTransfer.files[0]); };

function insert(f: File) {
  if (!selected) return;
  const url = URL.createObjectURL(f);
  sheet.setCellValue(selected.row, selected.col, `audio:${url}`);
  sheet.forceRender?.();
}
