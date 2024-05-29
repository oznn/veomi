import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Player from './Player';
import { Server, Entry, Result } from '../../types';
import styles from '../../styles/Watch.module.css';

const {
  electron: { store },
} = window;

export default function Watch() {
  const [searchParams] = useSearchParams();
  const startAt = searchParams.get('startAt') || '';
  const resultString = searchParams.get('result') || '{}';
  const result = JSON.parse(resultString) as Result;
  const [entry, setEntry] = useState<Entry | null>(null);
  const [servers, setServers] = useState<Server[] | null>(null);
  const [server, setServer] = useState<number>(0);
  const [video, setVideo] = useState(null);
  const [episode, setEpisode] = useState<number>(
    startAt ? Number(startAt) : -1,
  );
  const container = useRef<HTMLDivElement>(null);
  const entryKey = (result.ext + result.path).replace(/\./g, ' ');
  const nav = useNavigate();

  useEffect(() => {
    (async () => {
      const res = await store.get(`entries.${entryKey}`);
      document.onfullscreenchange = () =>
        !document.fullscreenElement && nav(-1);
      setEntry(res);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!entry) return;
      try {
        const { getServers } = await import(`../../extensions/${result.ext}`);
        if (episode === -1)
          setEpisode(entry.episodes.map(({ isSeen }) => isSeen).indexOf(false));
        if (episode > -1) {
          const res = (await getServers(entry.episodes[episode])) as Server[];
          setServers(res);
        }
      } catch (err) {
        console.log(`failed to set servers ${err}`);
      }
    })();
  }, [entry, episode]);

  useEffect(() => {
    if (!entry || !servers || servers.length === 0 || video) return;
    if (container.current && !document.fullscreenElement) {
      container.current.requestFullscreen();
    }
    (async () => {
      try {
        const { getVideo } = await import(`../../extensions/${result.ext}`);
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
    // eslint-disable-next-line
    <div
      className={styles.container}
      ref={container}
    >
      <div className={styles.header}>
        <h3>{entry.episodes[episode].title}</h3>
        <details>
          <summary>Servers</summary>
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
        </details>
      </div>
      {video && (
        <Player
          video={video}
          entry={entry}
          episode={episode}
          next={() =>
            episode < entry.episodes.length - 1 && changeEpisode(episode + 1)
          }
          prev={() => episode > 0 && changeEpisode(episode - 1)}
        />
      )}
    </div>
  );
}
