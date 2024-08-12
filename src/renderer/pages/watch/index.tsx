import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Player from './Player';
import { Server, Entry, Video } from '../../types';
import styles from '../../styles/Watch.module.css';
import cloud from '../../../../assets/cloud.png';

const {
  electron: { store },
} = window;

export default function Watch() {
  const [searchParams] = useSearchParams();
  const startAt = searchParams.get('startAt');
  const entryKey = searchParams.get('key') || '';
  const [entry, setEntry] = useState<Entry | null>(null);
  const [servers, setServers] = useState<Server[] | null>(null);
  const [serverIdx, setServerIdx] = useState(-1);
  const [video, setVideo] = useState<Video | null>(null);
  const [episodeIdx, setEpisodeIdx] = useState(startAt ? Number(startAt) : -1);
  const [isShowServers, setIsShowServers] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const nav = useNavigate();
  const [err, setErr] = useState('');

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
      // eslint-disable-next-line
      const { getServers, getVideo } = await import(
        `../../extensions/${entry.result.ext}`
      );
      if (episodeIdx === -1) {
        // eslint-disable-next-line
        const n = (() => {
          for (let i = 0; i < entry.episodes.length; i += 1)
            if (!entry.episodes[i].isSeen) return i;
        })();
        setEpisodeIdx(n ?? 0);
      } else {
        try {
          const v = entry ? entry.episodes[episodeIdx].download.video : null;
          const res = (await getServers(
            entry.episodes[episodeIdx],
          )) as Server[];
          if (v) res.unshift({ name: 'LOCAL', id: '' });
          const preferredServIdx = res.findIndex(
            ({ name }) => name === entry.settings.preferredServ,
          );

          setServers(res);
          setServerIdx(Math.max(0, preferredServIdx));
        } catch (e) {
          const v = entry ? entry.episodes[episodeIdx].download.video : null;

          if (v) {
            setServers([{ name: 'LOCAL', id: '' }]);
            setServerIdx(0);
          } else setErr('No servers found');
        }
      }
    })();
  }, [entry, episodeIdx]);

  useEffect(() => {
    setErr('');
    if (serverIdx === -1 || !servers || video) return;
    if (container.current && !document.fullscreenElement)
      container.current.requestFullscreen();
    const v = entry ? entry.episodes[episodeIdx].download.video : null;
    if (v && serverIdx === 0) return setVideo(v); //eslint-disable-line

    (async () => {
      const { getVideo } = await import(
        `../../extensions/${entry?.result.ext}`
      );
      try {
        const res = await getVideo(servers[serverIdx]);

        setVideo(res);
      } catch (e) {
        setErr('Selected server is not working');
      }
    })();
  }, [servers, serverIdx]);

  function changeServer(i: number) {
    setVideo(null);
    if (servers && entry) {
      entry.settings.preferredServ = servers[i].name;
      store.set(`entries.${entryKey}.settings.preferredServ`, servers[i].name);
      setServerIdx(i);
    }
  }
  function changeEpisode(i: number) {
    if (entry) {
      setVideo(null);
      setEpisodeIdx(i);
    }
  }

  if (!entry || !servers) return '';

  return (
    // eslint-disable-next-line
    <div className={styles.container} ref={container}>
      <header>
        <span>{entry.episodes[episodeIdx].title}</span>
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
      {err && <div className={styles.serverErr}>{err}</div>}
      {video && (
        <Player
          video={video}
          entry={entry}
          episode={episodeIdx}
          isShowServers={isShowServers}
          setIsShowServers={(b: boolean) => setIsShowServers(b)}
          next={() =>
            episodeIdx < entry.episodes.length - 1 &&
            changeEpisode(episodeIdx + 1)
          }
        />
      )}
    </div>
  );
}
