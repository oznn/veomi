import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Result, Entry as T } from '../../types';
import styles from '../../styles/Entry.module.css';

const {
  electron: { store },
} = window;
export default function Entry() {
  const [entry, setEntry] = useState<T | null>(null);
  const [searchParams] = useSearchParams();
  const resultString = searchParams.get('result') || '{}';
  const result = JSON.parse(resultString) as Result;
  const key = (result.ext + result.path).replace(/\./g, ' ');

  async function getAndSetEntry() {
    const { getEntry } = await import(`../../extensions/${result.ext}`);
    const res = (await getEntry(result)) as T | undefined;
    if (res) {
      if (entry) {
        entry.details.poster = res.details.poster;
        entry.details.isCompleted = res.details.isCompleted;
        entry.episodes = entry.episodes.concat(
          res.episodes.splice(entry.episodes.length, res.episodes.length),
        );
        store.set(`entries.${key}`, entry);
        setEntry(structuredClone(entry));
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

  const watchURL = `/watch?result=${encodeURIComponent(
    JSON.stringify(result),
  )}`;

  function addToLibary() {
    store.push('libary', result);
    if (entry) {
      entry.isInLibary = true;
      store.set(`entries.${key}.isInLibary`, true);
      setEntry(structuredClone(entry));
    }
  }
  function toggleIsSeen(i: number) {
    if (entry) {
      const toggle = !entry.episodes[i].isSeen;
      const isSeenKey = `entries.${key}.episodes.${i}.isSeen`;
      entry.episodes[i].isSeen = toggle;
      store.set(isSeenKey, toggle);
      setEntry(structuredClone(entry));
    }
  }

  return (
    <div className={styles.container}>
      <br />
      <button type="button" onClick={getAndSetEntry}>
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
