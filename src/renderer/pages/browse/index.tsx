import { Link, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Result } from '../../types';

function Results({ results }: { results: Result[] }) {
  if (results.length === 0) return <h1>0 results.</h1>;
  return (
    <ul>
      {results.map((result) => (
        <li key={result.path}>
          <Link to={`/entry?ext=${result.ext}&path=${result.path}`}>
            {result.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function Browse() {
  const [results, setResults] = useState<Result[] | null>(null);
  const [query, setQuery] = useState('');
  const [searchParams] = useSearchParams();
  const ext = searchParams.get('ext') || '';

  useEffect(() => {
    if (!query) return;
    (async () => {
      try {
        const { getResults } = await import(`../../extensions/${ext}`);

        setResults((await getResults(query)) as Result[]);
      } catch (err) {
        console.log(`${err}`);
      }
    })();
  }, [query]);

  return (
    <div>
      <input
        type="search"
        placeholder="search"
        onKeyUp={({ key, target }) => {
          if (key === 'Enter') {
            setResults(null);
            setQuery((target as HTMLInputElement).value);
          }
        }}
      />
      {query &&
        (results ? <Results results={results} /> : <h1>loading results...</h1>)}
    </div>
  );
}
