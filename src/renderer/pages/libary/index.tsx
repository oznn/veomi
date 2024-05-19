import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Result } from '../../types';

const { electron } = window;

export default function Libary() {
  const [results, setResults] = useState<Result[] | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await electron.send('store-get', 'libary');
        setResults((res as Result[]) || []);
      } catch (err) {
        console.log(`${err}`);
      }
    })();
  }, []);

  if (results === null) return <h1>loading results...</h1>;

  function remove(i: number) {
    if (results) {
      results.splice(i, 1);
      electron.send('store-set', 'libary', results);
      setResults(structuredClone(results));
    }
  }
  return (
    <ul>
      {results.map((result, i) => (
        <li key={result.title}>
          <Link
            to={`/entry?result=${encodeURIComponent(JSON.stringify(result))}`}
          >
            {result.title}
          </Link>
          <button type="button" onClick={() => remove(i)}>
            remove
          </button>
          <Link to={`/watch?ext=${result.ext}&path=${result.path}`}>
            resume
          </Link>
        </li>
      ))}
    </ul>
  );
}
