import { Link } from 'react-router-dom';
import { Result } from '../types';

export default function Results({ results }: { results: Result[] }) {
  if (results.length === 0) return <h1>0 results.</h1>;
  return (
    <ul>
      {results.map((result) => (
        <li key={result.title}>
          <Link
            to={`/entry?result=${encodeURIComponent(JSON.stringify(result))}`}
          >
            {result.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}
