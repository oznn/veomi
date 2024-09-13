import useDidMountEffect from '@components/useDidMountEffect';
// import Loading from '@components/loading';
import Message from '@components/message';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ReactNode, useEffect, useRef } from 'react';
import { Entry, Server, Video } from '@types';
import { useAppSelector } from '../../redux/store';
import { setServer, setVideo } from '../../redux';
import Player from './Player';

function Container({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const nav = useNavigate();

  useEffect(() => {
    document.onfullscreenchange = () => !document.fullscreenElement && nav(-1);
    if (containerRef.current && !document.fullscreenElement) {
      containerRef.current.requestFullscreen();
    }
  }, []);

  return <div ref={containerRef}>{children}</div>;
}

export default function Watch() {
  const dispatch = useDispatch();
  const app = useAppSelector((state) => state.app);
  const entry = app.entry as Entry;
  const { episodeIdx, server, video } = app;

  useEffect(() => {
    (async () => {
      const { getServers } = await import(
        `../../../ext/extensions/${entry.result.ext}`
      );
      const list = (await getServers(
        entry.episodes[episodeIdx].id,
      )) as Server[];
      const idx = list.findIndex(
        ({ name }) => name === entry.settings.preferredServer,
      );

      dispatch(setServer({ list, idx: Math.max(0, idx) }));
    })();

    return () => {
      dispatch(setVideo({ video: null }));
    };
  }, [episodeIdx]);

  useDidMountEffect(() => {
    (async () => {
      try {
        const { getVideo } = await import(
          `../../../ext/extensions/${entry.result.ext}`
        );

        if (server.list && server.list.length) {
          const res = (await getVideo(server.list[server.idx])) as Video;
          const sourceIdx = Math.max(
            res.sources.findIndex(
              ({ qual }: { qual: number }) =>
                qual === entry.settings.preferredQuality,
            ),
            0,
          );
          const trackIdx = res.tracks
            ? res.tracks.findIndex(
                ({ label }) =>
                  label?.includes(entry.settings.preferredSubtitles),
              )
            : -1;

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
        <Message msg="Selected server failed, try another" />
      </Container>
    );

  return <Container>{video && <Player />}</Container>;
}
