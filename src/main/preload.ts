// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels = 'change-origin';

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
