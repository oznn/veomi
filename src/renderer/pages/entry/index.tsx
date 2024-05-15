import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Result, Entry as T } from '../../types';

const { electron } = window;
export default function Entry() {
  const [entry, setEntry] = useState<T | null>(null);
  const [searchParams] = useSearchParams();
  const ext = searchParams.get('ext') || '';
  const resultString = searchParams.get('result') || '{}';
  const result = JSON.parse(resultString) as Result;

  async function updateEntry() {
    const { getEntry } = await import(`../../extensions/extension/${ext}`);
    const res = await getEntry(result);
    if (res) {
      await electron.send('store-set', `${ext} ${result.path}`, res);
      setEntry(res);
    }
  }
  useEffect(() => {
    (async () => {
      try {
        const key = `${ext} ${result.path}`;
        const res = (await electron.send('store-get', key)) as T | undefined;
        if (res) setEntry(res);
        else updateEntry();
      } catch (err) {
        console.log(`${err}`);
      }
    })();
  }, []);

  if (entry === null) return <h1>loading entry...</h1>;

  const watchURL = `/watch?ext=${ext}&episodes=${encodeURIComponent(
    JSON.stringify(entry.episodes),
  )}`;

  function addToLibary() {
    electron.send('store-push', 'libary', result);
    if (entry) setEntry({ ...entry, isInLibary: true });
  }

  return (
    <div>
      <button type="button" onClick={updateEntry}>
        refresh
      </button>
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
