import { useEffect, useReducer, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Entry as T } from '../../types';
import styles from '../../styles/Entry.module.css';
import loadingStyles from '../../styles/Loading.module.css';
import extensions from '../ext';

const {
  electron: { store, poster, video },
} = window;
let isShiftDown = false;
export default function Entry() {
  const [, rerender] = useReducer((n) => n + 1, 0);
  const nav = useNavigate();
  const [entry, setEntry] = useState<T | null>(null);
  const [downloads, setDownloads] = useState([]);
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
  function download() {
    if (entry)
      video.queue(
        selectedEpisodes.map((e) => ({ entryKey: entry.key, episodeIdx: e })),
      );
  }
  useEffect(() => {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Shift') isShiftDown = true;
    });
    window.addEventListener('keyup', (e) => {
      if (e.key === 'Shift') isShiftDown = false;
    });
    window.electron.ipcRenderer.on('video-progress', (l) => {
      console.log('from entry page', l as any);
    });
    (async () => {
      try {
        const res = (await store.get(`entries.${key}`)) as T | undefined;
        console.log(res);
        if (res) setEntry(res);
        else getAndSetEntry();
      } catch (err) {
        console.log(`${err}`);
      }
    })();
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
          {entry.episodes.map(({ title, info }, i) => (
            <li
              key={title}
              style={{ listStyle: entry.episodes[i].isSeen ? 'none' : 'disc' }}
            >
              <button
                type="button"
                className={styles.episode}
                title={info && info.join(' • ')}
                onAuxClick={({ button }) => button - 1 && toggleSelect(i)}
                onClick={() => nav(`${watchURL}&startAt=${i}`)}
                style={{
                  background: selectedEpisodes.includes(i)
                    ? 'rgba(255,255,255,.1)'
                    : 'none',
                }}
              >
                <span>{title}</span>
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
          </div>
        )}
      </div>
    );
}
