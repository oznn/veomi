import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { baseURL } from '../../utils';

type T = { details: any; episodes: { title: string; info: string[] }[] };
export default function Entry() {
  const [entry, setEntry] = useState<T | null>(null);
  const [searchParams] = useSearchParams();
  const ext = searchParams.get('ext') || '';
  const body = searchParams.get('body') || '';

  useEffect(() => {
    (async () => {
      try {
        const url = `${baseURL}/extensions/${ext}/entry`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
        });
        // const episodesList = (await res.json()).episodes;
        setEntry(await res.json());
      } catch (err) {
        console.log(`${err}`);
      }
    })();
  }, []);

  if (entry === null) return <h1>loading entry...</h1>;

  const watchURL = `/watch?ext=${ext}&episodes=${encodeURIComponent(
    JSON.stringify(entry.episodes),
  )}`;

  return (
    <div>
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
