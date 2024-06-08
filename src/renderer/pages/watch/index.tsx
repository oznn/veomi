import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Player from './Player';
import { Server, Entry } from '../../types';
import styles from '../../styles/Watch.module.css';

const {
  electron: { store },
} = window;

export default function Watch() {
  const [searchParams] = useSearchParams();
  const startAt = searchParams.get('startAt');
  const ext = searchParams.get('ext') || '';
  const path = searchParams.get('path') || '';
  const [entry, setEntry] = useState<Entry | null>(null);
  const [servers, setServers] = useState<Server[] | null>(null);
  const [server, setServer] = useState<number>(0);
  const [video, setVideo] = useState(null);
  const [episode, setEpisode] = useState(startAt ? Number(startAt) : NaN);
  const container = useRef<HTMLDivElement>(null);
  const entryKey = (ext + path).replace(/\./g, ' ');
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
        // getVideo wont work in prod if its not imported here
        const { getServers, getVideo } = await import(`../../extensions/${ext}`);//eslint-disable-line
        if (Number.isNaN(episode)) {
          const n = (() => { // eslint-disable-line
            for (let i = 0; i < entry.episodes.length; i += 1)
              if (!entry.episodes[i].isSeen) return i;
          })();
          setEpisode(n ?? 0);
        } else {
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
        const { getVideo } = await import(`../../extensions/${ext}`);
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

  if (!entry || !servers) return '';
  if (servers.length === 0) return <h1>0 servers.</h1>;
  return (
    // eslint-disable-next-line
    <div
      className={styles.container}
      ref={container}
    >
      <header>
        <span>
          <button
            type="button"
            onClick={() => document.exitFullscreen()}
          >{` <= `}</button>
          {entry.episodes[episode].title}
        </span>
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
      </header>
      {video && (
        <Player
          video={video}
          entry={entry}
          episode={episode}
          next={() =>
            episode < entry.episodes.length - 1 && changeEpisode(episode + 1)
          }
        />
      )}
    </div>
  );
}
