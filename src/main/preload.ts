// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import type { Video } from '../renderer/types.d.ts';

export type Channels =
  | 'change-origin'
  | 'ffmpeg-progress'
  | 'ffmpeg-ended'
  | 'ffmpeg-download'
  | 'console-log';

type VideoFile = {
  folderName: string;
  fileName: string;
  episodeKey: string;
  video: Video;
};

const electronHandler = {
  store: {
    get: async (k: string) => ipcRenderer.invoke('store-get', k),
    set(k: string, v: unknown) {
      ipcRenderer.invoke('store-set', k, v);
    },
    push(k: string, v: unknown) {
      ipcRenderer.invoke('store-push', k, v);
    },
    delete(k: string) {
      ipcRenderer.invoke('store-delete', k);
    },
  },
  poster: {
    download: (url: string, name: string) =>
      ipcRenderer.invoke('poster-download', url, name),
    delete: (path: string | undefined) =>
      ipcRenderer.invoke('poster-delete', path),
  },
  ffmpeg: {
    start: () => ipcRenderer.invoke('ffmpeg-start'),
    stop: () => ipcRenderer.invoke('ffmpeg-stop'),
    download: (videoFile: VideoFile) =>
      ipcRenderer.invoke('ffmpeg-download', videoFile),
    // delete: (path: string | undefined) =>
    //   ipcRenderer.invoke('ffmpeg-delete', path),
  },
  extractor: {
    megacloud: (ciphered: string) =>
      ipcRenderer.invoke('extractor-megacloud', ciphered),
  },
  fs: {
    remove: (path: string) => ipcRenderer.invoke('fs-remove', path),
  },
  dialog: {
    showMessage: (msg: string) => ipcRenderer.invoke('dialog-showMessage', msg),
  },
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
