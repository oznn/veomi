import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ext } from '../../utils';
import Playlist from './Playlist';

export default function Watch() {
  const [searchParams] = useSearchParams();
  const body = searchParams.get('entry') || '';
  const [episodes, setEpisodes] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const url = `${ext.url}/${ext.path}/episodes`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
        });
        setEpisodes((await res.json()).episodes);
      } catch (err) {
        console.log(`${err}`);
      }
    })();
  }, [body]);

  if (episodes.length === 0) return <h1>loading episodes...</h1>;
  return <Playlist episodes={episodes} />;
}
