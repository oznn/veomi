import { useEffect, useReducer, useState } from 'react';
import { Entry, Episode } from '../../types';

const {
  electron: { store },
} = window;

let pending: (Episode & { entryKey: string; entryTitle: string })[] | null =
  null;

const f = (a: any, b: any) => {
  (a[b.entryTitle] = a[b.entryTitle] || []).push(b);
  return a;
};

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
      rerender();
    })();
  }, []);
  useEffect(() => {
    const sub = window.electron.ipcRenderer.on(
      'ffmpeg-progress',
      (episodeId, episodeKey, progress) => {
        if (pending && typeof progress === 'number') {
          const idx = pending.findIndex((ep) => ep.id === episodeId);
          if (idx !== -1) {
            pending[idx].download.progress = progress;
            store.set(`${episodeKey}.download.progress`, progress);
            rerender();
          }
        }
      },
    );

    return sub;
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

  if (!pending || !pending.length)
    return (
      <span
        style={{
          display: 'block',
          textAlign: 'center',
        }}
      >
        Queue is empty
      </span>
    );
  if (pending)
    return (
      <>
        {/* pending.length && !isDownloading && (
          <button
            type="button"
            onClick={() => {
              ffmpeg.start();
              setIsDownloading(true);
            }}
          >
            Resume
          </button>
        ) */}
        <ul>
          {Object.keys(pending.reduce(f, {})).map((k) => (
            <li key={k}>
              <span style={{ fontSize: '1em', fontWeight: 500 }}>{k}</span>
              <ul>
                {pending &&
                  pending.reduce(f, {})[k].map((e: Episode) => (
                    <li key={e.title} style={{ color: 'silver' }}>
                      <span>{Math.floor(e.download.progress)}%</span> {e.title}
                    </li>
                  ))}
              </ul>
            </li>
          ))}
        </ul>
      </>
    );
}
