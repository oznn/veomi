import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Entries from '../../components/Entries';
import { baseURL } from '../../utils';

export default function Browse() {
  const [entries, setEntries] = useState(null);
  const [searchParams] = useSearchParams();
  const ext = searchParams.get('ext') || '';

  useEffect(() => {
    (async () => {
      try {
        const url = `${baseURL}/extensions/${ext}/entries?sort=latest`;
        const res = await (await fetch(url)).json();

        setEntries(res);
      } catch (err) {
        console.log(`${err}`);
      }
    })();
  }, []);

  if (entries === null) return <h1>loading entries...</h1>;
  return <Entries entries={entries} />;
}
