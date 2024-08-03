/* eslint global-require: off, no-console: off, promise/always-return: off */
/* eslint-disable promise/no-callback-in-promise */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain, session } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import Store from 'electron-store';
import { existsSync, createWriteStream, unlink } from 'fs';
import { mkdir } from 'fs/promises';
import { Readable } from 'stream';
import { finished } from 'stream/promises';
import Ffmpeg from 'fluent-ffmpeg';
import { resolveHtmlPath } from './util';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mw: BrowserWindow | null = null;
let origin: string | null = null;
const store = new Store();

type Video = {
  folderName: string;
  fileName: string;
  episodeId: string;
  episodeKey: string;
  source: {
    file: string;
    qual: string;
  };
  track: {
    file: string;
    label: string;
  } | null;
  skips: { intro: number[]; outro: number[] };
};

let ffmpeg: null | Ffmpeg.FfmpegCommand = null;
ipcMain.handle('ffmpeg-start', () => mw?.webContents.send('ffmpeg-download'));
ipcMain.handle('ffmpeg-stop', () => {
  if (ffmpeg) {
    ffmpeg.kill('SIGKILL');
    store.set('ffmpegDownloading', '');
    mw?.webContents.send('ffmpeg-download');
  }
});
ipcMain.handle('ffmpeg-download', async (_, video: Video) => {
  ffmpeg = Ffmpeg();

  const appDataDir = app.getPath('userData');
  const downloadsDir = path.join(appDataDir, 'downloads');
  if (!existsSync(downloadsDir)) await mkdir(downloadsDir);
  const folder = `${downloadsDir}/${video.folderName}`;
  if (!existsSync(folder)) await mkdir(folder);

  console.log('video', video);
  ffmpeg
    .input(video.source.file)
    .output(`${folder}/${video.fileName}.mp4`)
    // .addOption('-threads 1')
    .on('error', (err) => mw?.webContents.send('console-log', err))
    .on('progress', (progress) => {
      // video.progress = Math.floor(progress.percent);
      console.log(video.fileName, progress.percent);
      mw?.webContents.send(
        'ffmpeg-progress',
        video.episodeId,
        video.episodeKey,
        progress.percent,
      );

      // store.set(`${videoList[0].episodeKey}.download.progress`, videoList);
    })
    .on('end', async () => {
      store.set('ffmpegDownloading', '');
      store.set(`${video.episodeKey}.download.isPending`, false);
      store.set(`${video.episodeKey}.download.isCompleted`, true);
      const vid = {
        sources: [
          { file: `${folder}/${video.fileName}.mp4`, qual: video.source.qual },
        ],
        tracks: [],
        skips: video.skips,
      };
      store.set(`${video.episodeKey}.download.video`, vid);
      mw?.webContents.send('ffmpeg-ended', video.episodeId, video.episodeKey);
      mw?.webContents.send('ffmpeg-download');
    })
    .run();
  store.set('ffmpegDownloading', video.episodeKey);
});
ipcMain.on('change-origin', (_, newOrigin) => (origin = newOrigin));//eslint-disable-line
ipcMain.handle('store-get', (_, k) => store.get(k));
ipcMain.handle('store-set', (_, k, v) => store.set(k, v));
ipcMain.handle('store-delete', (_, k) => store.delete(k));
ipcMain.handle('store-push', (_, k, v) => {
  const a = (store.get(k) as unknown[]) || [];
  a.push(v);
  store.set(k, a);
});
ipcMain.handle('poster-download', async (_, url, entryKey) => {
  try {
    const appDataDir = app.getPath('userData');
    const postersDir = path.join(appDataDir, 'posters');
    if (!existsSync(postersDir)) await mkdir(postersDir);
    const filename = entryKey.replace(/[<>:"/\\|?*]/g, ' '); //eslint-disable-line
    const { body } = await fetch(url);
    const fileType = url.slice(url.lastIndexOf('.'), url.length);
    const posterPath = path.join(postersDir, filename) + fileType;
    const stream = createWriteStream(posterPath);

    if (body) await finished(Readable.fromWeb(body as any).pipe(stream));
    store.set(`entries.${entryKey}.details.posterPath`, posterPath);
  } catch (err) {
    console.log('poster-download', err);
  }
});
ipcMain.handle(
  'poster-delete',
  async (_, posterPath) =>
    posterPath && unlink(posterPath, (e) => console.log(e)),
);
if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

// const installExtensions = async () => {
//   const installer = require('electron-devtools-installer');
//   const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
//   const extensions = ['REACT_DEVELOPER_TOOLS'];
//
//   return installer
//     .default(
//       extensions.map((name) => installer[name]),
//       forceDownload,
//     )
//     .catch(console.log);
// };

const RESOURCES_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'assets')
  : path.join(__dirname, '../../assets');

const getAssetPath = (...paths: string[]): string => {
  return path.join(RESOURCES_PATH, ...paths);
};

Ffmpeg.setFfmpegPath(getAssetPath('ffmpeg.exe'));
Ffmpeg.setFfprobePath(getAssetPath('ffprobe.exe'));

const createWindow = async () => {
  // if (isDebug) {
  //   await installExtensions();
  // }

  mw = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
      webSecurity: false,
    },
  });

  mw.loadURL(resolveHtmlPath('index.html'));
  mw.setMenu(null);
  mw.maximize();

  mw.on('ready-to-show', () => {
    if (!mw) {
      throw new Error('"mw" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mw.minimize();
    } else {
      mw.show();
    }
  });

  mw.on('closed', () => {
    // store.set('ffmpegDownloading', '');
    mw = null;
  });

  // Open urls in the user's browser
  mw.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
app.on('web-contents-created', (_, wc) => {
  wc.on('before-input-event', (event, input) => {
    if (input.key === 'F11' && mw) {
      mw.setFullScreen(!mw.isFullScreen());
      event.preventDefault();
    }
  });
});
app
  .whenReady()
  .then(() => {
    createWindow();
    session.defaultSession.webRequest.onBeforeSendHeaders(
      { urls: ['*://*/*'] },
      (details, callback) => {
        details.requestHeaders.Referer = details.url;
        if (origin) details.requestHeaders.Origin = origin;

        callback({ cancel: false, requestHeaders: details.requestHeaders });
      },
    );
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mw === null) createWindow();
    });
  })
  .catch(console.log);
