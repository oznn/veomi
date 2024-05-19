import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Result, Entry as T } from '../../types';

const { electron } = window;
export default function Entry() {
  const [entry, setEntry] = useState<T | null>(null);
  const [searchParams] = useSearchParams();
  const resultString = searchParams.get('result') || '{}';
  const result = JSON.parse(resultString) as Result;
  const key = result.ext + result.path;

  async function getAndSetEntry() {
    const { getEntry } = await import(
      `../../extensions/extension/${result.ext}`
    );
    const res = (await getEntry(result)) as T | undefined;
    if (res) {
      if (entry) {
        entry.details.poster = res.details.poster;
        entry.episodes = entry.episodes.concat(
          res.episodes.splice(entry.episodes.length, res.episodes.length),
        );
        electron.send('store-set', key, entry);
        setEntry(structuredClone(entry));
      } else {
        electron.send('store-set', key, res);
        setEntry(res);
      }
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

  const watchURL = `/watch?ext=${result.ext}&path=${result.path}`;

  function addToLibary() {
    electron.send('store-push', 'libary', result);
    if (entry) {
      entry.isInLibary = true;
      electron.send('store-set', key, entry);
      setEntry(structuredClone(entry));
    }
  }
  function toggleIsSeen(i: number) {
    if (entry) {
      entry.episodes[i].isSeen = !entry.episodes[i].isSeen;
      electron.send('store-set', key, entry);
      setEntry(structuredClone(entry));
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
            <button type="button" onClick={() => toggleIsSeen(i)}>
              mark as {entry.episodes[i].isSeen ? 'unseen' : 'seen'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
