import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Result } from '../../types';
import styles from '../../styles/Browse.module.css';
import loadingStyles from '../../styles/Loading.module.css';
import resultsStyles from '../../styles/Results.module.css';
import extensions from '../ext';

function Results({ results }: { results: Result[] }) {
  if (results.length === 0)
    return (
      <span
        style={{
          display: 'block',
          textAlign: 'center',
        }}
      >
        No results found
      </span>
    );
  return (
    <ul className={resultsStyles.container}>
      {results.map((result) => (
        <Link
          key={result.ext + result.path}
          className={resultsStyles.link}
          to={`/entry?result=${JSON.stringify(result)}`}
        >
          <div>
            <img loading="lazy" src={result.posterURL} alt="poster" />
          </div>
          <span title={result.title}>{result.title}</span>
        </Link>
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
    <div className={styles.container}>
      <input
        autoFocus //eslint-disable-line
        type="text"
        defaultValue={query}
        placeholder={`Search ${extensions[ext].name}`}
        onKeyUp={({ key, target }) => {
          if (key === 'Enter') {
            setResults(null);
            const q = (target as HTMLInputElement).value;
            nav(`/browse?query=${q}&ext=${ext}`);
          }
        }}
      />
      <br />
      <br />
      {query && !results ? (
        <div className={loadingStyles.container} />
      ) : (
        results && <Results results={results} />
      )}
    </div>
  );
}
