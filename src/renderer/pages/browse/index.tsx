import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Result } from '../../types';

function Results({ results }: { results: Result[] }) {
  if (results.length === 0) return <h1>0 results.</h1>;
  return (
    <ul>
      {results.map(({ path, ext, title, key, posterURL }) => (
        <li key={key}>
          <img src={posterURL} alt="poster" />
          <Link to={`/entry?ext=${ext}&path=${path}`}>{title}</Link>
        </li>
      ))}
    </ul>
  );
}

const { electron } = window;
export default function Browse() {
  const [results, setResults] = useState<Result[] | null>(null);
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const ext = searchParams.get('ext') || '';
  const query = searchParams.get('query') || '';

  useEffect(() => {
    if (!query) return;
    (async () => {
      electron.ipcRenderer.sendMessage('change-origin');
      const { getResults } = await import(`../../extensions/${ext}`);

      setResults((await getResults(query)) as Result[]);
    })();
  }, [query]);

  return (
    <div>
      <input
        type="search"
        defaultValue={query}
        placeholder="search"
        onKeyUp={({ key, target }) => {
          if (key === 'Enter') {
            setResults(null);
            const q = (target as HTMLInputElement).value;
            nav(`/browse?query=${q}&ext=${ext}`);
          }
        }}
      />
      {query && !results ? (
        <h1>loading results...</h1>
      ) : (
        results && <Results results={results} />
      )}
    </div>
  );
}
