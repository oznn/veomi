import useDidMountEffect from '@components/useDidMountEffect';
import Message from '@components/message';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ReactNode, useEffect, useRef } from 'react';
import { Entry, PlayerSettings, Server, Video } from '@types';
import { useAppSelector } from '../../redux/store';
import { setServer, setServerIdx, setVideo } from '../../redux';
import Player from './Player';
import styles from './styles.module.css';

const { electron } = window;
function Container({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const nav = useNavigate();

  useEffect(() => {
    document.onfullscreenchange = () => !document.fullscreenElement && nav(-1);
    if (containerRef.current && !document.fullscreenElement) {
      containerRef.current.requestFullscreen();
    }
    return () => {
      electron.ipcRenderer.sendMessage('change-referrer', null);
      electron.ipcRenderer.sendMessage('change-origin', null);
    };
  }, []);

  return <div ref={containerRef}>{children}</div>;
}

export default function Watch() {
  const dispatch = useDispatch();
  const app = useAppSelector((state) => state.app);
  const entry = app.entry as Entry;
  const { mediaIdx, server, video } = app;

  useEffect(() => {
    const { downloaded } = entry.media[mediaIdx];
    (async () => {
      if (downloaded && !navigator.onLine) {
        return dispatch(
          setServer({ list: [{ name: 'local', id: '' }], idx: 0, retries: 0 }),
        );
      }
      // eslint-disable-next-line
      const { getVideo, getServers } = await import(
        `../../../ext/extensions/${entry.result.ext}`
      );
      const { preferredServer } = entry.settings as PlayerSettings;
      const { id } = entry.media[mediaIdx];
      const list = (await getServers(id)) as Server[];
      const idx = list.findIndex(({ name }) => name === preferredServer);

      if (downloaded)
        dispatch(
          setServer({
            list: [{ name: 'local', id: '' }, ...list],
            idx: 0,
            retries: 0,
          }),
        );
      else dispatch(setServer({ list, idx: Math.max(0, idx), retries: 0 }));
    })();

    return () => {
      dispatch(setVideo({ video: null }));
    };
  }, [mediaIdx]);

  useDidMountEffect(() => {
    const downloaded = entry.media[mediaIdx].downloaded as Video;
    if (downloaded && server.idx === 0)
      return dispatch(setVideo({ video: downloaded, sourceIdx: 0 }));
    (async () => {
      try {
        const { getVideo } = await import(
          `../../../ext/extensions/${entry.result.ext}`
        );

        if (server.list && server.list.length) {
          const res = (await getVideo(server.list[server.idx])) as Video;
          const { preferredQuality, preferredSubtitles } =
            entry.settings as PlayerSettings;
          const f = ({ qual }: { qual: number }) => qual === preferredQuality;
          const sourceIdx = Math.max(res.sources.findIndex(f), 0);
          const g = ({ label }: { label: string }) =>
            label?.includes(preferredSubtitles);
          const trackIdx = res.tracks ? res.tracks.findIndex(g) : -1;

          dispatch(setVideo({ video: res, sourceIdx, trackIdx }));
        }
      } catch (e) {
        console.log(e);
        dispatch(setVideo({ video: undefined }));
      }
    })();
  }, [server]);

  if (server.list && !server.list.length)
    return (
      <Container>
        <Message msg="No servers found" />
      </Container>
    );
  if (video === undefined)
    return (
      <Container>
        <br />
        <br />
        <Message msg="Selected server failed, try another" />
        <div className={styles.servers}>
          {server.list?.map(({ name }, i) => (
            <button
              type="button"
              key={name}
              onClick={() => dispatch(setServerIdx(i))}
              disabled={server.idx === i}
            >
              <span
                style={{
                  opacity: server.idx === i ? 1 : 0,
                  transform: `scale(${server.idx === i ? 1 : 3})`,
                  borderRadius: '50%',
                }}
              />
              {name}
            </button>
          ))}
        </div>
      </Container>
    );

  return <Container>{video && <Player />}</Container>;
}
