// src/custom-function.ts
import {
  UniverPlugin,
  PluginType,
  IAccessor,
  CellRenderFactoryService,
} from '@univerjs/core';

export class AudioCellPlugin extends UniverPlugin {
  static override type = PluginType.Sheets;

  install(accessor: IAccessor) {
    const renderSvc = accessor.get(CellRenderFactoryService);

    renderSvc.registerCellRenderer('__type:audio', ({ cellRect, value }) => {
      const audio = document.createElement('audio');
      audio.controls = true;
      audio.src = value.src;                // MP3/OGG/WAV URL
      audio.style.width  = `${cellRect.width}px`;
      audio.style.height = '28px';
      return { root: audio };
    });
  }
}
