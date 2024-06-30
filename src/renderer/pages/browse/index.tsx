import { Link, useSearchParams } from 'react-router-dom';
import { useReducer } from 'react';
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

let results: Result[] | null = null;
let isLoading = false;
let query = '';
export default function Browse() {
  console.log('results', results);
  // const [results, setResults] = useState<Result[] | null>(null);
  // const [query, setQuery] = useState('');
  const [, rerender] = useReducer((n) => n + 1, 0);
  const [searchParams] = useSearchParams();
  const ext = searchParams.get('ext') || '';

  // useEffect(() => {
  //   if (!query) return;
  //   (async () => {
  //     try {
  //       const { getResults } = await import(`../../extensions/${ext}`);
  //
  //       results = (await getResults(query)) as Result[];
  //       rerender();
  //     } catch (err) {
  //       console.log(`${err}`);
  //     }
  //   })();
  // }, [query]);

  async function search(q: string) {
    const { getResults } = await import(`../../extensions/${ext}`);

    results = (await getResults(q)) as Result[];
    query = q;
    isLoading = false;
    rerender();
  }

  return (
    <div>
      <input
        type="search"
        defaultValue={query}
        placeholder="search"
        onKeyUp={({ key, target }) => {
          if (key === 'Enter') {
            isLoading = true;
            rerender();
            search((target as HTMLInputElement).value);
          }
        }}
      />
      {/*
      !isLoading && results ? (
        <Results results={results} />
      ) : (
        <h1>loading results...</h1>
      )
      */}
      {isLoading ? (
        <h1>loading results...</h1>
      ) : (
        results && <Results results={results} />
      )}
    </div>
  );
}
