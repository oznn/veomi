import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Results from '../../components/Results';
import { Result } from '../../types';

export default function Browse() {
  const [results, setResults] = useState<Result[] | null>(null);
  const [query, setQuery] = useState('');
  const [searchParams] = useSearchParams();
  const ext = searchParams.get('ext') || '';

  useEffect(() => {
    (async () => {
      try {
        const { getResults } = await import(
          `../../extensions/extension/${ext}`
        );

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
          if (key === 'Enter') setQuery((target as HTMLInputElement).value);
        }}
      />
      {results ? <Results results={results} /> : <h1>loading results...</h1>}
    </div>
  );
}
