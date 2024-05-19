import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Player from './Player';
import { Server, Entry } from '../../types';

const { electron } = window;

export default function Watch() {
  const [searchParams] = useSearchParams();
  const startAt = searchParams.get('startAt') || '';
  const ext = searchParams.get('ext') || '';
  const path = searchParams.get('path') || '';
  const [entry, setEntry] = useState<Entry | null>(null);
  const [servers, setServers] = useState<Server[] | null>(null);
  const [server, setServer] = useState<number>(0);
  const [video, setVideo] = useState(null);
  const [episode, setEpisode] = useState<number>(
    startAt ? Number(startAt) : -1,
  );
  useEffect(() => {
    (async () => {
      setEntry(await electron.send('store-get', ext + path));
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!entry) return;
      try {
        const { getServers } = await import(
          `../../extensions/extension/${ext}`
        );
        if (episode === -1)
          setEpisode(entry.episodes.map(({ isSeen }) => isSeen).indexOf(false));
        if (episode > -1) setServers(await getServers(entry.episodes[episode]));
      } catch (err) {
        console.log(`failed to set servers ${err}`);
      }
    })();
  }, [entry, episode]);

  useEffect(() => {
    if (!entry || !servers || servers.length === 0 || video) return;
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
  function changeEpisode(i: number) {
    if (entry) {
      setVideo(null);
      setEpisode(i);
    }
  }

  if (!entry || !servers) return <h1>loading servers....</h1>;
  if (servers.length === 0) return <h1>0 servers.</h1>;
  return (
    <div>
      <ul>
        {servers.map(({ name }, i) => (
          <li key={name}>
            <button
              type="button"
              onClick={() => changeServer(i)}
              disabled={server === i}
            >
              {name}
            </button>
          </li>
        ))}
      </ul>
      <h1>episode: {episode + 1}</h1>
      {video ? (
        <Player video={video} entry={entry} ep={episode} />
      ) : (
        <h1>loading video...</h1>
      )}
      <button
        type="button"
        onClick={() => changeEpisode(episode - 1)}
        disabled={episode === 0}
      >
        prev
      </button>
      <button
        type="button"
        onClick={() => changeEpisode(episode + 1)}
        disabled={episode === entry.episodes.length - 1}
      >
        next
      </button>
    </div>
  );
}
