import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Player from './Player';
import { Server, Entry } from '../../types';
import styles from '../../styles/Watch.module.css';
import cloud from '../../../../assets/cloud.png';

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
  const [serverIdx, setServerIdx] = useState(-1);
  const [video, setVideo] = useState(null);
  const [episode, setEpisode] = useState(startAt ? Number(startAt) : -1);
  const [isShowServers, setIsShowServers] = useState(false);
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
      // getVideo wont work in prod if its not imported here
      const { getServers, getVideo } = await import(`../../extensions/${ext}`);//eslint-disable-line
      if (episode === -1) {
        const n = (() => { // eslint-disable-line
          for (let i = 0; i < entry.episodes.length; i += 1)
            if (!entry.episodes[i].isSeen) return i;
        })();
        setEpisode(n ?? 0);
      } else {
        const res = (await getServers(entry.episodes[episode])) as Server[];
        const preferredServ = res.findIndex(
          ({ name }) => name === entry.preferredServ,
        );
        setServers(res);
        setServerIdx(Math.max(0, preferredServ));
      }
    })();
  }, [entry, episode]);

  useEffect(() => {
    if (serverIdx === -1 || !servers || video) return;
    if (container.current && !document.fullscreenElement)
      container.current.requestFullscreen();

    (async () => {
      const { getVideo } = await import(`../../extensions/${ext}`);
      const res = await getVideo(servers[serverIdx]);

      setVideo(res);
    })();
  }, [servers, serverIdx]);

  function changeServer(i: number) {
    setVideo(null);
    if (servers && entry) {
      entry.preferredServ = servers[i].name;
      store.set(`entries.${entryKey}.preferredServ`, servers[i].name);
      setServerIdx(i);
    }
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
        <span>{entry.episodes[episode].title}</span>
        <img // eslint-disable-line
          src={cloud}
          alt="cloud"
          onClick={() => setIsShowServers(!isShowServers)}
        />
      </header>
      {isShowServers && (
        <div className={styles.servers}>
          {servers.map(({ name }, i) => {
            const isCurrent = serverIdx === i;
            return (
              <div key={name}>
                <button
                  type="button"
                  onClick={() => changeServer(i)}
                  disabled={isCurrent}
                >
                  <span
                    style={{
                      opacity: isCurrent ? 1 : 0,
                      transform: `scale(${isCurrent ? 1 : 3})`,
                      borderRadius: '50%',
                    }}
                  />
                  {name}
                </button>
              </div>
            );
          })}
        </div>
      )}
      {video && (
        <Player
          video={video}
          entry={entry}
          episode={episode}
          isShowServers={isShowServers}
          setIsShowServers={(b: boolean) => setIsShowServers(b)}
          next={() =>
            episode < entry.episodes.length - 1 && changeEpisode(episode + 1)
          }
        />
      )}
    </div>
  );
}
