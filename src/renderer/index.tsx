import { createRoot } from 'react-dom/client';
import App from './pages';
import { Entry, Server, Video } from './types';
import extensions from './pages/ext';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(<App />);

const {
  electron: { store, ffmpeg },
} = window;
window.electron.ipcRenderer.on('ffmpeg-download', async () => {
  const res = (await window.electron.store.get('entries')) as Entry[];
  const entries = Object.values(res);
  let episodeIdx: number = -1;
  let entry: Entry | null = null;

  for (let i = 0; i < entries.length; i += 1) {
    const idx = entries[i].episodes.findIndex((e) => e.download.isPending);
    if (idx !== -1) {
      entry = entries[i];
      episodeIdx = idx;
      break;
    }
  }
  if (!entry) return;

  const { getServers, getVideo } = await import(
    `./extensions/${entry.result.ext}`
  );
  const servers = (await getServers(entry.episodes[episodeIdx])) as Server[];
  const preferredServ = servers.findIndex(
    ({ name }) => name === entry.settings.preferredServ,
  );
  const vid = (await getVideo(servers[Math.max(0, preferredServ)])) as Video;
  const preferredQual = vid.sources.findIndex(
    ({ qual }) => entry.settings.preferredQual === qual,
  );
  const preferredTrackIdx = vid.tracks.findIndex(
    ({ label }) => label?.includes(entry.settings.preferredSubs),
  );
  const { name } = extensions[entry.result.ext];
  const { title } = entry.result;
  const v = {
    folderName: `[${name}] ${title.replace(/[<>:"/\\|?*]/g, ' ')}`,
    fileName: entry.episodes[episodeIdx].title.replace(/[<>:"/\\|?*]/g, ' '),
    episodeId: entry.episodes[episodeIdx].id,
    episodeKey: `entries.${entry.key}.episodes.${episodeIdx}`,
    source: {
      file: vid.sources[preferredQual === -1 ? 0 : preferredQual].file,
      qual: vid.sources[preferredQual === -1 ? 0 : preferredQual].qual,
    },
    track: vid.tracks.length
      ? {
          file: vid.tracks[preferredTrackIdx === -1 ? 0 : preferredTrackIdx]
            .file,
          label:
            vid.tracks[preferredTrackIdx === -1 ? 0 : preferredTrackIdx].label,
        }
      : null,
    skips: vid.skips,
  };
  if (vid.tracks.length) {
    v.track = {
      file: vid.tracks[preferredTrackIdx === -1 ? 0 : preferredTrackIdx].file,
      label: vid.tracks[preferredTrackIdx === -1 ? 0 : preferredTrackIdx].label,
    };
  }
  ffmpeg.download(v);
});
window.electron.ipcRenderer.on('console-log', (arg) => {
  console.log(arg);
});

(async () => {
  const res = await store.get('ffmpegDownloading');
  if (res) ffmpeg.start();
})();
