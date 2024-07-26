import { createRoot } from 'react-dom/client';
import App from './pages';
import { Entry, Server, Video } from './types';
import extensions from './pages/ext';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(<App />);

const {
  electron: { store, video },
} = window;
window.electron.ipcRenderer.on('video-download', async (arg) => {
  const { entryKey, episodeIdx } = arg as {
    entryKey: string;
    episodeIdx: number;
  };
  const entry = (await store.get(`entries.${entryKey}`)) as Entry;
  const { getServers, getVideo } = await import(`./extensions/${entry.ext}`);
  const servers = (await getServers(entry.episodes[episodeIdx])) as Server[];
  const preferredServ = servers.findIndex(
    ({ name }) => name === entry.preferredServ,
  );
  const vid = (await getVideo(servers[Math.max(0, preferredServ)])) as Video;
  const preferredQual = vid.sources.findIndex(
    ({ qual }) => entry.preferredQual === qual,
  );
  const { name } = extensions[entry.ext];
  const { title } = entry.details;
  const v = {
    entryTitle: title,
    episodeTitle: entry.episodes[episodeIdx].title,
    folderName: `[${name}] ${title.replace(/[<>:"/\\|?*]/g, ' ')}`,
    fileName: entry.episodes[episodeIdx].title.replace(/[<>:"/\\|?*]/g, ' '),
    episodeKey: `entries.${entry.key}.episodes.${episodeIdx}`,
    url: vid.sources[preferredQual].file,
    progress: 0,
  };
  console.log(v);
  video.download(v);
});
