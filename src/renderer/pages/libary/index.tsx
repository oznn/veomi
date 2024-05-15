import { useState, useEffect } from 'react';
import { Result } from '../../types';
import Results from '../../components/Results';

const { electron } = window;

export default function Libary() {
  const [results, setResults] = useState<Result[] | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await electron.send('store-get', 'libary');
        setResults((res as Result[]) || []);
      } catch (err) {
        console.log(`${err}`);
      }
    })();
  }, []);

  if (results === null) return <h1>loading results...</h1>;
  return <Results results={results} />;
}
