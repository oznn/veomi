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
  if (!results.length) return <Message msg={`No results for "${query}"`} />;

  return (
    <>
      <h4 style={{ textAlign: 'center' }}>{`"${query}"`}</h4>
      <ul className={resultsStyles.container}>
        {results.map((result, i) => (
          <Link
            key={Math.random()}
            className={resultsStyles.link}
            to={`/${
              result.type === 'LIVE' ? 'live' : 'entry'
            }?result=${encodeURIComponent(JSON.stringify(result))}`}
          >
            <div>
              {result.posterURL && (
                <img
                  style={{ transitionDelay: `${i * 10}ms` }}
                  onLoad={(e) => (e.target.style.opacity = 1)}
                  src={result.posterURL}
                  alt="poster"
                />
              )}
            </div>
            <span className={resultsStyles.title} title={result.title}>
              {result.title}
            </span>
          </Link>
        ))}
      </ul>
    </>
  );
}
