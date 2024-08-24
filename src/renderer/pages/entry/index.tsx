import { useEffect, useReducer, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Result, Entry as T } from '../../types';
import styles from '../../styles/Entry.module.css';
import loadingStyles from '../../styles/Loading.module.css';
import checkmarkStyles from '../../styles/Checkmark.module.css';
import Details from './Details';

const {
  electron: { store, ffmpeg },
} = window;
let isShiftDown = false;
export default function Entry() {
  const [, rerender] = useReducer((n) => n + 1, 0);
  const nav = useNavigate();
  const [entry, setEntry] = useState<T | null>(null);
  const [selectedEpisodes, setSelectedEpisodes] = useState([] as number[]);
  const [searchParams] = useSearchParams();
  const result = JSON.parse(searchParams.get('result') || '{}') as Result;
  const key = searchParams.get('key') || '';

  useEffect(() => {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Shift') isShiftDown = true;
    });
    window.addEventListener('keyup', (e) => {
      if (e.key === 'Shift') isShiftDown = false;
    });
    // eslint-disable-next-line
    (async () => {
      try {
        if (key) setEntry(await store.get(`entries.${key}`));
        else {
          const entryKey = (result.ext + result.path).replace(/\./g, ' ');
          const e = (await store.get(`entries.${entryKey}`)) as T | undefined;
          if (e) return setEntry(e);

          const { getDetails, getEpisodes } = await import(
            `../../extensions/${result.ext}`
          );
          const details = await getDetails(result);
          const episodes = (await getEpisodes(result)) || [];
          const settings = await store.get('settings');

          const res = {
            key: entryKey,
            result,
            episodes,
            details,
            isInLibary: false,
            settings: settings || {
              volume: 10,
              playback: 1,
              isSkip: { intro: true, outro: true },
              preferredSubs: '',
              preferredQual: 0,
              preferredServ: '',
            },
          };

          store.set(`entries.${res.key}`, res);
          setEntry(res);
        }
      } catch (err) {
        console.log(`${err}`);
      }
    })();
  }, []);
  useEffect(() => {
    const sub = window.electron.ipcRenderer.on('ffmpeg-ended', (episodeId) => {
      setEntry((e) => {
        if (e) {
          const idx = e.episodes.findIndex((ep) => ep.id === episodeId);
          e.episodes[idx].download.isPending = false;
          e.episodes[idx].download.isCompleted = true;
        }
        return e;
      });
      rerender();
    });
    return sub;
  }, []);

  if (!entry) return <div className={loadingStyles.container} />;

  function toggleIsSeen() {
    if (entry) {
      const selected = selectedEpisodes.filter((e) => entry.episodes[e].isSeen);
      const toggle = selected.length * 2 > selectedEpisodes.length;
      selectedEpisodes.forEach((e) => {
        const isSeenKey = `entries.${entry.key}.episodes.${e}.isSeen`;

        entry.episodes[e].isSeen = !toggle;
        store.set(isSeenKey, !toggle);
        setSelectedEpisodes([]);
      });
    }
  }

  // eslint-disable-next-line
  function toggleSelect(i: number) {
    if (isShiftDown) {
      const last = selectedEpisodes.at(-1) || 0;
      const first = selectedEpisodes.at(0) || 0;
      const arr = [];
      if (i > last) for (let j = last; j < i + 1; j += 1) arr.push(j);
      else for (let j = i; j < first + 1; j += 1) arr.push(j);

      return setSelectedEpisodes(arr);
    }
    if (selectedEpisodes.includes(i))
      setSelectedEpisodes(selectedEpisodes.filter((n) => n !== i));
    else setSelectedEpisodes([...selectedEpisodes, i]);
  }
  async function download() {
    if (entry) {
      const f = (e: number) => entry.episodes[e].download.isPending;
      const isPending =
        selectedEpisodes.filter(f).length * 2 < selectedEpisodes.length;

      selectedEpisodes.forEach((idx) => {
        const episodeKey = `entries.${entry.key}.episodes.${idx}`;
        entry.episodes[idx].download.isPending = isPending;
        entry.episodes[idx].download.isCompleted = false;
        store.set(`${episodeKey}.download.isPending`, isPending);
        store.set(`${episodeKey}.download.isCompleted`, false);
      });
      const ffmpegDownloading = await store.get('ffmpegDownloading');
      const g = (e: number) =>
        `entries.${entry.key}.episodes.${e}` === ffmpegDownloading;

      if (isPending && !ffmpegDownloading) ffmpeg.start();
      else if (selectedEpisodes.findIndex(g) !== -1) ffmpeg.stop();

      setSelectedEpisodes([]);
    }
  }

  if (entry)
    return (
      <div className={styles.container}>
        <Details entry={entry} rerender={() => rerender()} />
        <span>{entry.episodes.length} Episodes</span>
        <ul style={{ margin: 0 }}>
          {entry.episodes.map((episode, i) => (
            <li
              key={episode.title}
              style={{ listStyle: entry.episodes[i].isSeen ? 'none' : 'disc' }}
            >
              <button
                type="button"
                className={styles.episode}
                title={episode.info && episode.info.join(' • ')}
                onAuxClick={({ button }) => button - 1 && toggleSelect(i)}
                onClick={() => nav(`/watch?key=${entry.key}&startAt=${i}`)}
                style={{
                  background: selectedEpisodes.includes(i)
                    ? 'rgba(255,255,255,.1)'
                    : 'none',
                }}
              >
                <span>
                  {episode.download.isPending && (
                    <span
                      style={{
                        width: '25px',
                        height: '25px',
                        borderWidth: '4px',
                        marginRight: '.2em',
                        display: 'inline-block',
                      }}
                      className={loadingStyles.container}
                    />
                  )}
                  {episode.download.isCompleted && (
                    <span className={checkmarkStyles.container} />
                  )}
                  {episode.title}
                </span>
              </button>
            </li>
          ))}
        </ul>
        {selectedEpisodes.length !== 0 && (
          <div className={styles.options}>
            <button
              type="button"
              onClick={toggleIsSeen}
              className={styles.action}
            >
              {selectedEpisodes.filter((e) => entry.episodes[e].isSeen).length *
                2 >
              selectedEpisodes.length
                ? 'Unseen'
                : 'Seen'}
            </button>
            <button type="button" onClick={download} className={styles.action}>
              {selectedEpisodes.filter(
                (e) => entry.episodes[e].download.isPending,
              ).length *
                2 >
              selectedEpisodes.length
                ? 'Cancel download'
                : 'Download'}
            </button>
          </div>
        )}
        <br />
      </div>
    );
}
