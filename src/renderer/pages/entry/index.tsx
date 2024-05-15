import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Result, Entry as T } from '../../types';

const { electron } = window;
export default function Entry() {
  const [entry, setEntry] = useState<T | null>(null);
  const [searchParams] = useSearchParams();
  const resultString = searchParams.get('result') || '{}';
  const result = JSON.parse(resultString) as Result;
  const key = `${result.ext} ${result.path}`;

  async function getAndSetEntry() {
    const { getEntry } = await import(
      `../../extensions/extension/${result.ext}`
    );
    let res = (await getEntry(result)) as T | undefined;
    if (res) {
      if (entry) {
        const updatedEntry = structuredClone(entry);
        updatedEntry.details.poster = res.details.poster;
        updatedEntry.episodes = res.episodes;
        res = updatedEntry;
      } else electron.send('store-set', key, res);
      setEntry(res);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const res = (await electron.send('store-get', key)) as T | undefined;
        if (res) setEntry(res);
        else getAndSetEntry();
      } catch (err) {
        console.log(`${err}`);
      }
    })();
  }, []);

  if (entry === null) return <h1>loading entry...</h1>;

  const watchURL = `/watch?ext=${result.ext}&episodes=${encodeURIComponent(
    JSON.stringify(entry.episodes),
  )}`;

  function addToLibary() {
    electron.send('store-push', 'libary', result);
    if (entry) {
      const updatedEntry = structuredClone(entry);
      updatedEntry.isInLibary = true;
      electron.send('store-set', key, updatedEntry);
      setEntry(updatedEntry);
    }
  }

  return (
    <div>
      <button type="button" onClick={getAndSetEntry}>
        refresh
      </button>
      <br />
      <button type="button" onClick={addToLibary} disabled={entry.isInLibary}>
        add to libary
      </button>
      <h1>details here</h1>
      <ul>
        {entry.episodes.map(({ title, info }, i) => (
          <li key={title}>
            <Link to={`${watchURL}&startAt=${i}`}>
              {title} <sub>{info.join(' ')}</sub>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
