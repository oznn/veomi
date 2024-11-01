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
import { app, BrowserWindow, shell, ipcMain, session, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import Store from 'electron-store';
import { existsSync, createWriteStream, unlink } from 'fs';
import { mkdir, rm } from 'fs/promises';
import { Readable } from 'stream';
import { finished } from 'stream/promises';
import Ffmpeg from 'fluent-ffmpeg';
import type { Video } from '../renderer/types.d.ts';
import { resolveHtmlPath } from './util';
import megacloudExtractor from './megacloudExtractor';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mw: BrowserWindow | null = null;
let origin: string | null = null;
let referrer: string | null = null;
const store = new Store();

type VideoFile = {
  folderName: string;
  fileName: string;
  episodeKey: string;
  video: Video;
};

let ffmpeg: null | Ffmpeg.FfmpegCommand = null;
ipcMain.handle('download-start', () => mw?.webContents.send('download-start'));
ipcMain.handle('ffmpeg-download', async (_, videoFile: VideoFile) => {
  ffmpeg = Ffmpeg();

  const appDataDir = app.getPath('userData');
  const downloadsDir = path.join(appDataDir, 'downloads');
  if (!existsSync(downloadsDir)) await mkdir(downloadsDir);
  const folder = `${downloadsDir}/${videoFile.folderName}`;
  if (!existsSync(folder)) await mkdir(folder);

  ffmpeg
    .input(videoFile.video.sources[0].file)
    .output(`${folder}/${videoFile.fileName}.mp4`)
    // .addOption('-threads 1')
    .on('error', (err) => console.log('ffmpeg err', err))
    .on('progress', (progress) => {
      console.log(videoFile.fileName, progress.percent);
      mw?.webContents.send('download-progress', progress.percent);
    })
    .on('end', async () => {
      videoFile.video.sources[0].file = `${folder}/${videoFile.fileName}.mp4`;
      if (videoFile.video.tracks) {
        const { tracks } = videoFile.video;
        const { body } = await fetch(tracks[0].file);
        const filePath = `${folder}/${videoFile.fileName}.vtt`;
        const stream = createWriteStream(filePath);

        if (body) await finished(Readable.fromWeb(body as any).pipe(stream));
        videoFile.video.tracks[0].file = filePath;
      }
      store.set(`${videoFile.episodeKey}.downloaded`, videoFile.video);
      mw?.webContents.send('download-start', true);
    })
    .run();
});
ipcMain.handle('ffmpeg-stop', () => {
  if (ffmpeg) {
    ffmpeg.kill('SIGKILL');
    mw?.webContents.send('ffmpeg-download');
  }
});

type ImagesFolder = {
  folderName: string;
  fileName: string;
  chapterKey: string;
  pages: string[];
};

ipcMain.handle('images-download', async (_, imagesFolder: ImagesFolder) => {
  const appDataDir = app.getPath('userData');
  const downloadsDir = path.join(appDataDir, 'downloads');
  if (!existsSync(downloadsDir)) await mkdir(downloadsDir);
  const entryFolder = `${downloadsDir}/${imagesFolder.folderName}`;
  if (!existsSync(entryFolder)) await mkdir(entryFolder);
  const chapterFolder = `${entryFolder}/${imagesFolder.fileName}`;
  if (!existsSync(chapterFolder)) await mkdir(chapterFolder);

  const pagesPaths = [];
  const { length } = imagesFolder.pages;
  for (let i = 0; i < length; i += 1) {
    const url = imagesFolder.pages[i];
    const { body } = await fetch(url); //eslint-disable-line
    const fileType = url.slice(url.lastIndexOf('.'), url.length);
    const pagePath = `${chapterFolder}/${i + 1}${fileType}`;
    const stream = createWriteStream(pagePath);

    if (body) {
      await finished(Readable.fromWeb(body as any).pipe(stream)); //eslint-disable-line
      console.log(imagesFolder.fileName, (i / (length - 1)) * 100);
      mw?.webContents.send('download-progress', (i / (length - 1)) * 100);
      pagesPaths.push(pagePath);
      if (i === length - 1) {
        store.set(`${imagesFolder.chapterKey}.downloaded`, pagesPaths);
        console.log('downloaded', imagesFolder.fileName);
        mw?.webContents.send('download-start', true);
      }
    }
  }
});
ipcMain.on('change-origin', (_, newOrigin) => (origin = newOrigin)); //eslint-disable-line
ipcMain.on('change-referrer', (_, newReferrer) => (referrer = newReferrer)); //eslint-disable-line
ipcMain.handle('store-get', (_, k) => store.get(k));
ipcMain.handle('store-set', (_, k, v) => store.set(k, v));
ipcMain.handle('store-delete', (_, k) => store.delete(k));
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
    store.set(`entries.${entryKey}.posterPath`, posterPath);
    return posterPath;
  } catch (err) {
    console.log('poster-download', err);
  }
});
ipcMain.handle(
  'poster-delete',
  async (_, posterPath) =>
    posterPath &&
    unlink(posterPath, (e) => console.log('could not remove the poster', e)),
);
ipcMain.handle('extractor-megacloud', (_, ciphered) =>
  megacloudExtractor(ciphered),
);
ipcMain.handle('fs-remove', (_, folderPath) => {
  const p = path.join(app.getPath('userData'), 'downloads', folderPath);
  if (existsSync(p)) rm(p, { recursive: true });
});
ipcMain.handle('dialog-showMessage', (_, message) => {
  if (mw) dialog.showMessageBox(mw, { message });
});

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
        // if (details.url.includes('/rcp_v'))
        //   console.log(
        //     details.url,
        //     ' | ',
        //     details.uploadData
        //       ? details.uploadData
        //           .map(({ bytes }) => bytes.toString())
        //           .join(' * ')
        //       : '',
        //   );
        details.requestHeaders.Referer =
          referrer || new URL(details.url).origin;
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
