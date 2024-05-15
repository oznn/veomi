import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Results from '../../components/Results';

export default function Browse() {
  const [results, setResults] = useState(null);
  const [searchParams] = useSearchParams();
  const ext = searchParams.get('ext') || '';

  useEffect(() => {
    (async () => {
      try {
        const { getResults } = await import(
          `../../extensions/extension/${ext}`
        );

        setResults(await getResults('latest'));
      } catch (err) {
        console.log(`${err}`);
      }
    })();
  }, []);

  if (results === null) return <h1>loading entries...</h1>;
  return <Results results={results} />;
}
