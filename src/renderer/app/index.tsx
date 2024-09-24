import { useEffect } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { Entry as EntryType, Queue, Server, Video } from '@types';
import Nav from './components/nav';
import Libary from './pages/libary';
import Browse from './pages/browse';
import Entry from './pages/entry';
import Watch from './pages/watch';
import Downloads from './pages/downloads';
import { store } from './redux/store';
import './index.css';
import { setQueue, setQueueProgress } from './redux';
import extensions from '../extensions';

const { electron } = window;

function A() {
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      async function download(isRemoveFirst: boolean) {
        const queue = (await electron.store.get('queue')) as Queue | [];
        let idx = queue.findIndex(({ isFailed }) => !isFailed);
        if (isRemoveFirst) queue.splice(idx, 1);

        idx = queue.findIndex(({ isFailed }) => !isFailed);
        const item = queue[idx];

        dispatch(setQueue(queue));
        if (!item) return;

        try {
          const { entryKey, episodeIdx } = item;
          const entry = (await electron.store.get(
            `entries.${entryKey}`,
          )) as EntryType;
          const { getServers, getVideo } = await import(
            `../ext/extensions/${entry.result.ext}`
          );
          const { id } = entry.episodes[item.episodeIdx];
          const serverList = (await getServers(id)) as Server[];
          const { preferredServer, preferredQuality, preferredSubtitles } =
            entry.settings;
          const f = ({ name }: { name: string }) => name === preferredServer;
          const serverIdx = Math.max(0, serverList.findIndex(f));
          const video = (await getVideo(serverList[serverIdx])) as Video;
          const g = ({ qual }: { qual: number }) => qual === preferredQuality;
          const sourceIdx = Math.max(0, video.sources.findIndex(g));
          const h = ({ label }: { label?: string }) =>
            label?.includes(preferredSubtitles);
          const trackIdx = video.tracks ? video.tracks.findIndex(h) : -1;
          const { name } = extensions[entry.result.ext];
          const { title } = entry.result;
          const episode = entry.episodes[episodeIdx];

          electron.ffmpeg.download({
            folderName: `[${name}] ${title.replace(/[<>:"/\\|?*]/g, ' ')}`,
            fileName: episode.title.replace(/[<>:"/\\|?*]/g, ' '),
            episodeKey: `entries.${entry.key}.episodes.${episodeIdx}`,
            video: {
              sources: [video.sources[sourceIdx]],
              tracks:
                video.tracks && trackIdx > -1
                  ? [video.tracks[trackIdx]]
                  : undefined,
              skips: video.skips,
            },
          });
        } catch (err) {
          console.log(err);
          dispatch(
            setQueue(
              queue.map((e, i) => (i === idx ? { ...e, isFailed: true } : e)),
            ),
          );
          download(false);
        }
      }
      const res = (await electron.store.get('queue')) || [];
      dispatch(setQueue(res));
      if (res.length) download(false);

      electron.ipcRenderer.on('ffmpeg-download', (isRemoveFirst) =>
        download(isRemoveFirst as boolean),
      );
      electron.ipcRenderer.on('ffmpeg-progress', (v) => {
        dispatch(setQueueProgress(v as number));
      });
    })();
  }, []);

  return '';
}
export default function App() {
  return (
    <Router>
      <Provider store={store}>
        <Nav />
        <A />
        <br />
        <Routes>
          <Route path="/" element={<Libary />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/entry" element={<Entry />} />
          <Route path="/watch" element={<Watch />} />
          <Route path="/downloads" element={<Downloads />} />
        </Routes>
        <br />
      </Provider>
    </Router>
  );
}
