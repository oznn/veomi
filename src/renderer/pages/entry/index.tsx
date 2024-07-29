import { useEffect, useReducer, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Entry as T } from '../../types';
import styles from '../../styles/Entry.module.css';
import loadingStyles from '../../styles/Loading.module.css';
import extensions from '../ext';

const {
  electron: { store, poster, ffmpeg },
} = window;
let isShiftDown = false;
export default function Entry() {
  const [, rerender] = useReducer((n) => n + 1, 0);
  const nav = useNavigate();
  const [entry, setEntry] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEpisodes, setSelectedEpisodes] = useState([] as number[]);
  const [searchParams] = useSearchParams();
  const ext = searchParams.get('ext') || '';
  const path = searchParams.get('path') || '';
  const key = (ext + path).replace(/\./g, ' ');
  const watchURL = `/watch?ext=${ext}&path=${path}`;

  async function getAndSetEntry() {
    setIsLoading(true);

    const { getEntry } = await import(`../../extensions/${ext}`);
    const res = (await getEntry(path)) as T | undefined;

    if (res) {
      if (entry) {
        entry.details.posterURL = res.details.posterURL;
        poster.download(res.details.posterURL, entry.key);
        if (res.details.isCompleted !== null)
          entry.details.isCompleted = res.details.isCompleted;
        for (let i = 0; i < entry.episodes.length; i += 1) {
          entry.episodes[i].title = res.episodes[i].title;
          entry.episodes[i].info = res.episodes[i].info;
        }
        for (let i = entry.episodes.length; i < res.episodes.length; i += 1)
          entry.episodes.push(res.episodes[i]);
        store.set(`entries.${entry.key}`, entry);

        setIsLoading(false);
      } else {
        store.set(`entries.${key}`, res);
        setEntry(res);
      }
      setIsLoading(false);
    }
  }
  useEffect(() => {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Shift') isShiftDown = true;
    });
    window.addEventListener('keyup', (e) => {
      if (e.key === 'Shift') isShiftDown = false;
    });
    (async () => {
      try {
        const res = (await store.get(`entries.${key}`)) as T | undefined;
        if (res) setEntry(res);
        else getAndSetEntry();
      } catch (err) {
        console.log(`${err}`);
      }
    })();
  }, []);
  useEffect(() => {
    const sub = window.electron.ipcRenderer.on(
      'ffmpeg-ended',
      (episodeId, episodeKey) => {
        store.set(`${episodeKey}.download.isPending`, false);
        store.set(`${episodeKey}.download.isCompleted`, true);
        setEntry((e) => {
          if (e) {
            const idx = e.episodes.findIndex((ep) => ep.id === episodeId);
            e.episodes[idx].download.isPending = false;
            e.episodes[idx].download.isCompleted = true;
          }
          return e;
        });
        rerender();
      },
    );
    return sub;
  }, []);

  if (!entry && isLoading) return <div className={loadingStyles.container} />;
  if (!entry) return '';

  function addToLibary() {
    if (entry) {
      entry.isInLibary = true;
      store.set(`entries.${key}.isInLibary`, true);
      poster.download(entry.details.posterURL, entry.key);

      rerender();
    }
  }
  function toggleIsSeen() {
    if (entry) {
      const selected = selectedEpisodes.filter((e) => entry.episodes[e].isSeen);
      const toggle = selected.length * 2 > selectedEpisodes.length;
      selectedEpisodes.forEach((e) => {
        const isSeenKey = `entries.${key}.episodes.${e}.isSeen`;

        entry.episodes[e].isSeen = !toggle;
        store.set(isSeenKey, !toggle);
        setSelectedEpisodes([]);
      });
    }
  }

  function toggleSelect(i: number) {//eslint-disable-line
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
        store.set(`${episodeKey}.download.isPending`, isPending);
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
        <div className={styles.banner}>
          <div>
            <img
              height={400}
              src={entry.details.posterPath || entry.details.posterURL}
              alt="poster"
            />
          </div>
          <div>
            <div className={styles.info}>
              <span title={entry.details.title} className={styles.title}>
                {entry.details.title}
              </span>
              <span>
                {entry.details.isCompleted !== null &&
                  (entry.details.isCompleted ? 'Completed • ' : 'Ongoing • ')}
                {entry.details.studio && `${entry.details.studio} •`}{' '}
                {extensions[ext].name}
              </span>
              <p>{entry.details.desc}</p>
            </div>
            <button
              className={styles.action}
              type="button"
              onClick={addToLibary}
              disabled={entry.isInLibary}
            >
              Add
            </button>
            <button
              type="button"
              className={styles.action}
              onClick={() => nav(`/watch?ext=${entry.ext}&path=${entry.path}`)}
            >
              {entry.episodes.some((e) => e.isSeen) ? 'Resume' : 'Start'}
            </button>
            <button
              type="button"
              className={styles.action}
              onClick={getAndSetEntry}
              disabled={isLoading}
            >
              Update
            </button>
          </div>
        </div>
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
                onClick={() => nav(`${watchURL}&startAt=${i}`)}
                style={{
                  background: selectedEpisodes.includes(i)
                    ? 'rgba(255,255,255,.1)'
                    : 'none',
                }}
              >
                <span>
                  {episode.download.isPending && 'Downloading... '}
                  {episode.download.isCompleted && 'Downloaded '}
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
                ? 'Mark as unseen'
                : 'Mark as seen'}
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
      </div>
    );
}
