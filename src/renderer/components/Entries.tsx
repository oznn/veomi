import { Link, useSearchParams } from 'react-router-dom';

type Props = {
  entries: { title: string; poster: string }[];
};

export default function Entries({ entries }: Props) {
  const [searchParams] = useSearchParams();
  const ext = searchParams.get('ext') || '';

  if (entries.length === 0) return <h1>0 entries.</h1>;
  return (
    <ul>
      {entries.map((entry) => (
        <li key={entry.title}>
          <Link
            to={`/entry?ext=${ext}&body=${encodeURIComponent(
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
