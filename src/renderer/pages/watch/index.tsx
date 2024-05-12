import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Player from './Player';

type Server = { name: string };
export default function Watch() {
  const [servers, setServers] = useState<Server[] | null>(null);
  const [server, setServer] = useState<number>(0);
  const [video, setVideo] = useState(null);
  const [searchParams] = useSearchParams();
  const ext = searchParams.get('ext') || '';
  const episodesString = searchParams.get('episodes') || '{}';
  const episodes = JSON.parse(episodesString);
  const startAt = searchParams.get('startAt') || '';

  useEffect(() => {
    (async () => {
      try {
        const { getServers } = await import(
          `../../extensions/extension/${ext}`
        );
        const res = await getServers(episodes[Number(startAt)]);
        setServers(res);
      } catch (err) {
        console.log(`failed to set servers ${err}`);
      }
    })();
  }, []);

  useEffect(() => {
    if (servers === null || servers.length === 0 || video) return;
    (async () => {
      try {
        const { getVideo } = await import(`../../extensions/extension/${ext}`);
        const res = await getVideo(servers[server]);

        setVideo(res);
      } catch (err) {
        console.log(`failed to set video ${err}`);
      }
    })();
  }, [servers, server]);

  function changeServer(i: number) {
    setVideo(null);
    setServer(i);
  }

  if (servers === null) return <h1>loading servers....</h1>;
  if (servers.length === 0) return <h1>0 servers.</h1>;
  return (
    <div>
      <ul>
        {servers.map(({ name }, i) => (
          <li key={name}>
            <button type="button" onClick={() => changeServer(i)}>
              {name}
            </button>
          </li>
        ))}
      </ul>
      {video ? <Player video={video} /> : <h1>loading video...</h1>}
    </div>
  );
}
