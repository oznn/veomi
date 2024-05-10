import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { baseURL } from '../../utils';
import Player from './Player';

type Server = { name: string };
export default function Watch() {
  const [servers, setServers] = useState<Server[] | null>(null);
  const [video, setVideo] = useState(null);
  const [searchParams] = useSearchParams();
  const ext = searchParams.get('ext') || '';
  const episodesString = searchParams.get('episodes') || '{}';
  const episodes = JSON.parse(episodesString);
  const startAt = searchParams.get('startAt') || '';

  useEffect(() => {
    (async () => {
      try {
        const url = `${baseURL}/extensions/${ext}/servers`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(episodes[Number(startAt)]),
        });
        setServers(await res.json());
      } catch (err) {
        console.log(`failed to set servers ${err}`);
      }
    })();
  }, []);

  useEffect(() => {
    if (servers === null || servers.length === 0 || video) return;
    (async () => {
      try {
        const url = `${baseURL}/extensions/${ext}/video`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(servers[0]),
        });
        setVideo(await res.json());
      } catch (err) {
        console.log(`failed to set video ${err}`);
      }
    })();
  }, [servers]);

  if (servers === null) return <h1>loading servers....</h1>;
  if (servers.length === 0) return <h1>0 servers.</h1>;
  if (video === null) return <h1>loading video....</h1>;
  return <Player video={video} />;
}
