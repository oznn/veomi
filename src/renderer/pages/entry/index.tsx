import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Entry as T } from '../../types';

const { electron } = window;
export default function Entry() {
  const [entry, setEntry] = useState<T | null>(null);
  const [searchParams] = useSearchParams();
  const ext = searchParams.get('ext') || '';
  const body = searchParams.get('body') || '{}';
  const parsedBody = JSON.parse(body);

  useEffect(() => {
    (async () => {
      try {
        let res = (await electron.send('store-get', body)) as null | T;
        if (res) setEntry(res);
        else {
          const { getEntry } = await import(
            `../../extensions/extension/${ext}`
          );
          res = await getEntry(parsedBody);
          if (res) {
            await electron.send('store-set', body, res);
            setEntry(res);
          }
        }
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
    electron.send('store-push', 'libary', parsedBody);
    if (entry) setEntry({ ...entry, isInLibary: !entry.isInLibary });
  }

  return (
    <div>
      <button type="button" onClick={addToLibary}>
        {entry.isInLibary ? 'remove from' : 'add to'} libary
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
