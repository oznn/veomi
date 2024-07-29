import { useEffect, useReducer, useState } from 'react';
import { Entry, Episode } from '../../types';

const {
  electron: { store, ffmpeg },
} = window;

let pending: (Episode & { entryKey: string; entryTitle: string })[] | null =
  null;

export default function Downloads() {
  const [, rerender] = useReducer((x) => x + 1, 0);
  const [isDownloading, setIsDownloading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = (await store.get('entries')) as Entry[];
      if (!res) return;
      const entries = Object.values(res);
      const episodes: (Episode & {
        entryKey: string;
        entryTitle: string;
      })[] = [];

      entries.forEach((entry) =>
        entry.episodes.forEach((ep) =>
          episodes.push({
            ...ep,
            entryKey: entry.key,
            entryTitle: entry.details.title,
          }),
        ),
      );
      pending = episodes.filter((e) => e.download.isPending);
      setIsDownloading(await store.get('ffmpegDownloading'));
      rerender();
    })();
  }, []);
  useEffect(() => {
    const sub = window.electron.ipcRenderer.on(
      'ffmpeg-ended',
      (episodeId, episodeKey) => {
        if (pending) {
          const idx = pending.findIndex((ep) => ep.id === episodeId);
          pending.splice(idx, 1);
          store.set(`${episodeKey}.download.isPending`, false);
          store.set(`${episodeKey}.download.isCompleted`, true);
          rerender();
        }
      },
    );

    return sub;
  }, []);
  useEffect(() => {
    const sub = window.electron.ipcRenderer.on(
      'ffmpeg-progress',
      (episodeId, episodeKey, progress) => {
        if (pending) {
          console.log('progress');
          const idx = pending.findIndex((ep) => ep.id === episodeId);
          if (idx !== -1) {
            pending[idx].download.progress = progress as number;
            store.set(`${episodeKey}.download.progress`, progress);
            rerender();
          }
        }
      },
    );

    return sub;
  }, []);

  if (pending && !pending.length) return <span>queue is empty</span>;
  if (pending)
    return (
      <>
        {pending.length && !isDownloading && (
          <button
            type="button"
            onClick={() => {
              ffmpeg.start();
              setIsDownloading(true);
            }}
          >
            Resume
          </button>
        )}
        <ul>
          {pending.map((episode) => (
            <li key={episode.title}>
              <h3>{episode.entryTitle}</h3>
              <span>
                {episode.title} {Math.floor(episode.download.progress)}%
              </span>
            </li>
          ))}
        </ul>
      </>
    );
}
