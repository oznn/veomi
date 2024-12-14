import Mpegts from 'mpegts.js';
import useDidMountEffect from '@components/useDidMountEffect';
import { Result } from '@types';
import Hls from 'hls.js';
import buttonStyles from '@styles/Button.module.css';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './styles.module.css';

const { electron } = window;
let volumeTimer: any;
let mpegtsPlayer: Mpegts.Player | null = null;
let cursorTimer: any;

function Container({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const nav = useNavigate();

  useEffect(() => {
    window.onkeydown = ({ key }) => {
      if (key === 'p' && mpegtsPlayer) {
        mpegtsPlayer.unload();
        mpegtsPlayer.load();
        mpegtsPlayer.play();
      }
    };
    document.onfullscreenchange = () => !document.fullscreenElement && nav(-1);
    if (containerRef.current && !document.fullscreenElement) {
      containerRef.current.requestFullscreen();
    }
  }, []);

  return (
    <div className={styles.container} ref={containerRef}>
      {children}
    </div>
  );
}

export default function Live() {
  const [searchParams] = useSearchParams();
  const [isShowCursor, setIsShowCursor] = useState(false);
  const resultString = searchParams.get('result') || '{}';
  const result = JSON.parse(decodeURIComponent(resultString)) as Result;
  const [streams, setStreams] = useState<{ file: string; qual: number }[]>([]);
  const [streamIdx, setStreamIdx] = useState(0);
  const [volume, setVolume] = useState(10);
  const [isShowVolume, setIsShowVolume] = useState(false);
  const stream = streams ? streams[streamIdx] : null;
  const videoRef = useRef<HTMLVideoElement>(null);
  const hls = new Hls({ debug: false });
  const nav = useNavigate();
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    (async () => {
      const { getStream } = await import(
        `../../../ext/extensions/${result.ext}`
      );

      const res = await getStream(result.path);
      if (res) setStreams(res);
      else nav(-1);
    })();

    return () => {
      hls.destroy();
      if (mpegtsPlayer) mpegtsPlayer.destroy();
      electron.ipcRenderer.sendMessage('change-referrer', null);
      electron.ipcRenderer.sendMessage('change-origin', null);
    };
  }, []);
  useDidMountEffect(() => {
    if (videoRef.current && stream) {
      if (stream.file.includes('.m3u8')) {
        hls.loadSource(stream.file);
        hls.attachMedia(videoRef.current);
        hls.on(Hls.Events.ERROR, (_, data) => console.log('hlsErr', data.type));
        videoRef.current.volume = 0.5;
        videoRef.current.play();
      } else {
        mpegtsPlayer = Mpegts.createPlayer({
          type: 'mse',
          isLive: true,
          url: stream.file,
        });
        mpegtsPlayer.attachMediaElement(videoRef.current);
        mpegtsPlayer.load();
        // mpegtsPlayer.volume = 0;
        mpegtsPlayer.play();
        // mpegtsPlayer.on(Mpegts.ErrorTypes.NETWORK_ERROR, (a) =>
        //   console.log('NETWORK_ERROR', a),
        // );
        // mpegtsPlayer.on(Mpegts.Events.MEDIA_INFO, (a) =>
        //   console.log('INFO', a),
        // );
        videoRef.current.onended = () => {
          console.log('ENDED');
          setRetryCount((c) => c + 1);

          // mpegtsPlayer.pause();
          // mpegtsPlayer.unload();
          // mpegtsPlayer.load();
          // mpegtsPlayer.play();
        };
        // mpegtsPlayer.en
        // mpegtsPlayer.on('')
      }
    }
  }, [streamIdx, streams, videoRef.current, retryCount]);

  function changeVolume(dv: number) {
    if (videoRef.current) {
      const v = Math.max(0, Math.min(volume + dv, 20));
      if (stream && stream.file.includes('.m3u8'))
        videoRef.current.volume = v * 0.05;
      else if (mpegtsPlayer) mpegtsPlayer.volume = v * 0.05;
      setVolume(v);
      setIsShowVolume(true);
      clearTimeout(volumeTimer);
      volumeTimer = setTimeout(() => setIsShowVolume(false), 1000);
    }
  }

  if (!stream) return <Container> </Container>;
  return (
    <Container>
      {/* eslint-disable-next-line */}
      <video
        ref={videoRef}
        style={{ cursor: isShowCursor ? 'auto' : 'none' }}
        onWheel={({ deltaY }) => changeVolume(deltaY < 0 ? 1 : -1)}
        onMouseMove={() => {
          setIsShowCursor(true);
          clearTimeout(cursorTimer);
          cursorTimer = setTimeout(() => setIsShowCursor(false), 2000);
        }}
      />
      <div className={styles.qual}>
        {streams.map((s, i) => (
          <button
            disabled={i === streamIdx}
            onClick={() => setStreamIdx(i)}
            className={buttonStyles.container}
            type="button"
            key={s.file}
          >
            {s.qual}p
          </button>
        ))}
      </div>
      <span className={styles.volume} style={{ opacity: +isShowVolume }}>
        {volume * 5}%
      </span>
    </Container>
  );
}
