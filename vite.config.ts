import { defineConfig, Plugin } from 'vite';

const injectAudioUI: Plugin = {
  name: 'inject-audio-ui',
  transformIndexHtml(html) {
    // 1) inject the sidebar markup + sheet‐wrapper
    const snippet = `
      <div id="sidebar" style="
        position:fixed; top:0; left:0; bottom:0;
        width:260px; padding:16px; background:#fafafa;
        border-right:1px solid #ddd; overflow:auto; z-index:9999;
      ">
        <h2>Audio Upload</h2>
        <p>1. Click a cell in the sheet to select it.</p>
        <p>2. Upload or drop an audio file:</p>
        <button id="upload-btn" style="width:100%;margin:8px 0;padding:8px;">📁 Choose Audio</button>
        <div id="drop-zone" style="
          border:2px dashed #bbb; border-radius:4px;
          height:80px; display:flex; align-items:center; justify-content:center;
          color:#666; margin:8px 0;
        ">Drop audio here</div>
        <input id="audio-input" type="file" accept="audio/*" style="display:none" />
        <hr/>
        <p>▶️ will appear in your cell—click to play/pause.</p>
      </div>
      <div id="sheet-wrapper" style="margin-left:260px; width:calc(100% - 260px); height:100vh;"></div>
    `;

    // 2) Inject right after the <body> tag
    return html.replace(
      /<body>/i,
      `<body>\n${snippet}`
    );
  },
};

export default defineConfig({
  plugins: [injectAudioUI],
  // ensure Vite still serves your normal index.html for everything else
});
