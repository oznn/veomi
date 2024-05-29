import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Result } from '../../types';

const {
  electron: { store },
} = window;

export default function Libary() {
  const [results, setResults] = useState<Result[] | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await store.get('libary');
        setResults((res as Result[]) || []);
      } catch (err) {
        console.log(`${err}`);
      }
    })();
  }, []);

  if (!results) return '';
  if (!results.length) return <h1>libary is empty.</h1>;

  function deleteFromLibary(i: number) {
    if (results) {
      const result = results[i];
      const entryKey = (result.ext + result.path).replace(/\./g, ' ');

      results.splice(i, 1);
      store.set('libary', results);
      store.set(`entries.${entryKey}.isInLibary`, false);
      setResults(structuredClone(results));
    }
  }

  return (
    <ul>
      {results.map((result, i) => (
        <li key={result.ext + result.path}>
          <Link
            to={`/watch?result=${encodeURIComponent(JSON.stringify(result))}`}
          >
            {result.title}
          </Link>
          <Link
            to={`/entry?result=${encodeURIComponent(JSON.stringify(result))}`}
          >
            <i>
              <b> entry page </b>
            </i>
          </Link>
          <button type="button" onClick={() => deleteFromLibary(i)}>
            delete
          </button>
        </li>
      ))}
    </ul>
  );
}
