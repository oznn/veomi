import { useEffect } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import {
  Entry as EntryType,
  PlayerSettings,
  Queue,
  Server,
  Video,
} from '@types';
import Nav from './components/nav';
import Libary from './pages/libary';
import Browse from './pages/browse';
import Entry from './pages/entry';
import Watch from './pages/watch';
import Downloads from './pages/downloads';
import { store } from './redux/store';
import './index.css';
import { refreshEntry, setQueue, setQueueProgress } from './redux';
import extensions from '../extensions';
import Read from './pages/read';
import Live from './pages/live';

const { electron } = window;

function Download() {
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      async function download(isRemoveFirst: boolean) {
        const queue = (await electron.store.get('queue')) as Queue | [];
        let idx = queue.findIndex(({ isFailed }) => !isFailed);
        if (isRemoveFirst) {
          queue.splice(idx, 1);
          dispatch(refreshEntry());
        }

        idx = queue.findIndex(({ isFailed }) => !isFailed);
        const item = queue[idx];

        dispatch(setQueue(queue));
        if (!item) return;

        if (item.mediaType === 'IMAGE') {
          try {
            const { entryKey, mediaIdx } = item;
            const entry = (await electron.store.get(
              `entries.${entryKey}`,
            )) as EntryType;
            const { getPages } = await import(
              `../ext/extensions/${entry.result.ext}`
            );
            const { name } = extensions[entry.result.ext];
            const { title } = entry.result;
            const chapter = entry.media[mediaIdx];

            electron.images.download({
              folderName: `[${name}] ${title.replace(/[<>:"/\\|?*]/g, ' ')}`,
              fileName: `Chapter ${chapter.title.split('.')[0]}`,
              chapterKey: `entries.${entry.key}.media.${mediaIdx}`,
              pages: await getPages(chapter.id),
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
        } else {
          try {
            const { entryKey, mediaIdx } = item;
            const entry = (await electron.store.get(
              `entries.${entryKey}`,
            )) as EntryType;
            const { getServers, getVideo } = await import(
              `../ext/extensions/${entry.result.ext}`
            );
            const { id } = entry.media[mediaIdx];
            const serverList = (await getServers(id)) as Server[];
            const { preferredServer, preferredQuality, preferredSubtitles } =
              entry.settings as PlayerSettings;
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
            const episode = entry.media[mediaIdx];

            electron.ffmpeg.download({
              folderName: `[${name}] ${title.replace(/[<>:"/\\|?*]/g, ' ')}`,
              fileName: `Episode ${episode.title.split('.')[0]}`,
              episodeKey: `entries.${entry.key}.media.${mediaIdx}`,
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
            dispatch(
              setQueue(
                queue.map((e, i) => (i === idx ? { ...e, isFailed: true } : e)),
              ),
            );
            download(false);
          }
        }
      }
      const res = (await electron.store.get('queue')) || [];
      dispatch(setQueue(res));
      if (res.length) download(false);

      electron.ipcRenderer.on('download-start', (isRemoveFirst) =>
        download(isRemoveFirst as boolean),
      );
      electron.ipcRenderer.on('download-progress', (v) => {
        dispatch(setQueueProgress(v as number));
      });
      electron.ipcRenderer.on('console-log', (m) => {
        console.log(m);
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
        <Download />
        <Routes>
          <Route path="/" element={<Libary />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/entry" element={<Entry />} />
          <Route path="/watch" element={<Watch />} />
          <Route path="/read" element={<Read />} />
          <Route path="/downloads" element={<Downloads />} />
          <Route path="/live" element={<Live />} />
        </Routes>
        <br />
      </Provider>
    </Router>
  );
}
