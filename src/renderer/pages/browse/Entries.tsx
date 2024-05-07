import { Link } from 'react-router-dom';
import { Entry } from '../../types';

export default function Entries({ entries }: { entries: Entry[] }) {
  if (entries.length === 0) return <h1>loading entries...</h1>;

  return (
    <ul>
      {entries.map((entry) => (
        <li key={entry.title}>
          <Link
            to={`/pages/watch?entry=${encodeURIComponent(
              JSON.stringify(entry),
            )}`}
          >
            {entry.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}
