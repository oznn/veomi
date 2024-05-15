import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const { electron } = window;
type T = { details: any; episodes: { title: string; info: string[] }[] };
export default function Entry() {
  const [entry, setEntry] = useState<T | null>(null);
  const [searchParams] = useSearchParams();
  const ext = searchParams.get('ext') || '';
  const body = searchParams.get('body') || '';

  useEffect(() => {
    (async () => {
      try {
        const { getEntry } = await import(`../../extensions/extension/${ext}`);
        let res = await electron.send('store-get', `${ext} ${body}`);
        if (res) setEntry(res);
        else {
          res = await getEntry(JSON.parse(body));
          await electron.send('store-set', `${ext} ${body}`, res);
          setEntry(res);
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
