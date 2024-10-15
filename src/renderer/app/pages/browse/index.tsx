import { Link, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Result } from '@types';
import Loading from '@components/loading';
import Message from '@components/message';
import resultsStyles from '@styles/Results.module.css';

export default function Browse() {
  const [results, setResults] = useState<Result[] | null>(null);
  const [searchParams] = useSearchParams();
  const ext = searchParams.get('ext') as string;
  const query = searchParams.get('query') as string;

  useEffect(() => {
    setResults(null);
    (async () => {
      const { getResults } = await import(`../../../ext/extensions/${ext}`);

      setResults((await getResults(query)) as Result[]);
    })();
  }, [ext, query]);

  if (!results) return <Loading />;
  if (!results.length) return <Message msg="No results found" />;

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
          <span className={resultsStyles.title} title={result.title}>
            {result.title}
          </span>
        </Link>
      ))}
    </ul>
  );
}

// https://proxybot.io/api/v1/71147c421c55efbfbea0a931b7c6376b?url=https://mangadex.org/covers/eac0159f-2768-49d7-8891-4202f3e9fb8c/ee3f0bbe-ef17-4dd2-8518-1a0c110f127e.jpg
