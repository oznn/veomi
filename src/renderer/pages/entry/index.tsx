import { useEffect, useReducer, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Entry as T } from '../../types';
import styles from '../../styles/Entry.module.css';

const {
  electron: { store },
} = window;
export default function Entry() {
  const [, rerender] = useReducer((n) => n + 1, 0);
  const [entry, setEntry] = useState<T | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchParams] = useSearchParams();
  const ext = searchParams.get('ext') || '';
  const path = searchParams.get('path') || '';
  const key = (ext + path).replace(/\./g, ' ');
  const watchURL = `/watch?ext=${ext}&path=${path}`;

  async function getAndSetEntry() {
    setIsRefreshing(true);
    const { getEntry } = await import(`../../extensions/${ext}`);
    const res = (await getEntry(path)) as T | undefined;

    if (res) {
      if (entry) {
        entry.details.poster = res.details.poster;
        if (Object.hasOwn(res.details, 'isCompleted')) {
          entry.details.isCompleted = res.details.isCompleted;
        }
        entry.episodes = entry.episodes.concat(
          res.episodes.splice(entry.episodes.length, res.episodes.length),
        );
        store.set(`entries.${key}`, entry);
        setIsRefreshing(false);
      } else {
        store.set(`entries.${key}`, res);
        setEntry(res);
      }
    }
  }

  useEffect(() => {
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

  if (entry === null) return <h1>loading entry...</h1>;

  function addToLibary() {
    if (entry) {
      entry.isInLibary = true;
      store.set(`entries.${key}.isInLibary`, true);
      rerender();
    }
  }
  function toggleIsSeen(i: number) {
    if (entry) {
      const toggle = !entry.episodes[i].isSeen;
      const isSeenKey = `entries.${key}.episodes.${i}.isSeen`;

      entry.episodes[i].isSeen = toggle;
      store.set(isSeenKey, toggle);
      rerender();
    }
  }

  return (
    <div className={styles.container}>
      <button type="button" onClick={getAndSetEntry} disabled={isRefreshing}>
        refresh
      </button>
      <button type="button" onClick={addToLibary} disabled={entry.isInLibary}>
        add to libary
      </button>
      <h2>{entry.details.title}</h2>
      <h4>{entry.details.isCompleted ? 'Completed' : 'Ongoin'}</h4>
      <ul>
        {entry.episodes.map(({ title, info }, i) => (
          <li key={title}>
            <Link title={info.join(' • ')} to={`${watchURL}&startAt=${i}`}>
              {`${title} `}
            </Link>
            <button type="button" onClick={() => toggleIsSeen(i)}>
              mark as {entry.episodes[i].isSeen ? 'unseen' : 'seen'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
