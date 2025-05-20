import { createUniver, defaultTheme, LocaleType, merge } from '@univerjs/presets';
import { UniverSheetsCorePreset } from '@univerjs/presets/preset-sheets-core';
import UniverPresetSheetsCoreEnUS from '@univerjs/presets/preset-sheets-core/locales/en-US';
import UniverPresetSheetsCoreZhCN from '@univerjs/presets/preset-sheets-core/locales/zh-CN';

import './style.css';
import '@univerjs/presets/lib/styles/preset-sheets-core.css';

// 1) Init Univer
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

const sheet = univerAPI.getCurrentWorkbook().getActiveSheet();
const hooks = univerAPI.getSheetHooks();

// 2) Inject CSS for our two‑panel layout
const style = document.createElement('style');
style.textContent = `
  html, body { margin:0; padding:0; height:100%; overflow:hidden; }
  #app-container { display:flex; height:100vh; width:100vw; }
  #controls {
    width:260px; min-width:200px;
    background:#fafafa; border-right:1px solid #ddd;
    padding:16px; box-sizing:border-box; overflow-y:auto;
  }
  #controls h2 { margin-top:0; font-size:18px; }
  #controls button { display:block; width:100%; margin:8px 0; padding:8px; font-size:14px; cursor:pointer; }
  #controls #drop-zone {
    border:2px dashed #bbb; border-radius:4px;
    height:80px; display:flex; align-items:center; justify-content:center;
    color:#666; font-size:13px; margin-top:8px;
  }
  #univer { flex:1; position:relative !important; }
`;
document.head.appendChild(style);

// 3) Build controls panel HTML
const controls = document.createElement('div');
controls.id = 'controls';
controls.innerHTML = `
  <h2>Audio Upload</h2>
  <p>1. Click a cell in the sheet to select it.</p>
  <p>2. Choose or drop an audio file:</p>
  <button id="upload-btn">📁 Choose Audio File</button>
  <div id="drop-zone">Drop audio file here</div>
  <input type="file" id="audio-input" accept="audio/*" style="display:none;" />
  <hr/>
  <p>▶️ will appear in the cell—click it to play/pause.</p>
`;

// 4) Reparent #univer into our new flex container
const univerDiv = document.getElementById('univer')!;
const appContainer = document.createElement('div');
appContainer.id = 'app-container';
appContainer.appendChild(controls);
appContainer.appendChild(univerDiv);
document.body.appendChild(appContainer);

// 5) Audio logic (from earlier)
const audioMap = new Map<string, HTMLAudioElement>();
let selectedCell: { row: number; col: number } | null = null;

// Draw ▶️/⏸️ in‑cell
hooks.onCellRender([{ 
  drawWith: (ctx, info) => {
    const { row, col, primaryWithCoord: { startX, startY } } = info;
    const v = sheet.getCellValue(row, col);
    if (typeof v === 'string' && v.startsWith('audio:')) {
      const key = `${row},${col}`;
      const playing = audioMap.get(key)?.paused === false;
      ctx.font = '14px sans-serif';
      ctx.fillText(playing ? '⏸️' : '▶️', startX + 4, startY + 14);
    }
  },
}]);

hooks.onCellPointerClick(({ row, col }) => {
  selectedCell = { row, col };
  const v = sheet.getCellValue(row, col);
  if (typeof v === 'string' && v.startsWith('audio:')) {
    const url = v.slice('audio:'.length);
    const key = `${row},${col}`;
    let audio = audioMap.get(key);
    if (!audio) {
      audio = new Audio(url);
      audioMap.set(key, audio);
      audio.addEventListener('ended', () => sheet.reRender());
    }
    audio.paused ? audio.play() : audio.pause();
    sheet.reRender();
  }
});

// 6) Wire upload button & drop zone
const uploadBtn = document.getElementById('upload-btn') as HTMLButtonElement;
const fileInput = document.getElementById('audio-input') as HTMLInputElement;
const dropZone  = document.getElementById('drop-zone')!;

// click→open picker
uploadBtn.addEventListener('click', () => fileInput.click());

// picker→insert
fileInput.addEventListener('change', () => {
  if (!selectedCell) return;
  const f = fileInput.files?.[0]; if (!f) return;
  const url = URL.createObjectURL(f);
  sheet.setCellValue(selectedCell.row, selectedCell.col, `audio:${url}`);
  sheet.reRender();
  fileInput.value = '';
});

// drag & drop
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
