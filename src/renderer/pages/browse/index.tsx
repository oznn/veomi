import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Entries from '../../components/Entries';

export default function Browse() {
  const [entries, setEntries] = useState(null);
  const [searchParams] = useSearchParams();
  const ext = searchParams.get('ext') || '';

  useEffect(() => {
    (async () => {
      try {
        // const res = await electron.send('extension-getEntries', ext, 'popular');
        // const { getEntires } = await import(`../extensions/extension/${ext}`);
        const { getEntries } = await import(
          `../../extensions/extension/${ext}`
        );
        const res = await getEntries('popular');

        setEntries(res);
      } catch (err) {
        console.log(`${err}`);
      }
    })();
  }, []);

  if (entries === null) return <h1>loading entries...</h1>;
  return <Entries entries={entries} />;
}
