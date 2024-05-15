import { Link, useSearchParams } from 'react-router-dom';
import { Result } from '../types';

export default function Results({ results }: { results: Result[] }) {
  const [searchParams] = useSearchParams();
  const ext = searchParams.get('ext') || '';

  if (results.length === 0) return <h1>0 results.</h1>;
  return (
    <ul>
      {results.map((result) => (
        <li key={result.title}>
          <Link
            to={`/entry?ext=${ext}&result=${encodeURIComponent(
              JSON.stringify(result),
            )}`}
          >
            {result.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}
