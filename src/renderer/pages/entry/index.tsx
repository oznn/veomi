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
  const [isLoading, setIsLoading] = useState(false);
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
        entry.details.poster = res.details.poster;
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

  if (isLoading) return <h1>loading entry...</h1>;
  if (!entry) return '';

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
      <button type="button" onClick={getAndSetEntry} disabled={isLoading}>
        update
      </button>
      <button type="button" onClick={addToLibary} disabled={entry.isInLibary}>
        add to libary
      </button>
      <h2>{entry.details.title}</h2>
      <ul>
        {entry.episodes.map(({ title, info }, i) => (
          <li key={title}>
            <button type="button" onClick={() => toggleIsSeen(i)}>
              mark as {entry.episodes[i].isSeen ? 'unseen' : 'seen'}
            </button>
            <Link title={info.join(' • ')} to={`${watchURL}&startAt=${i}`}>
              {`${title} `}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
