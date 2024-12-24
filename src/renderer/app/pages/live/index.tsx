import useDidMountEffect from '@components/useDidMountEffect';
import { Result } from '@types';
import Hls from 'hls.js';
import buttonStyles from '@styles/Button.module.css';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './styles.module.css';

const { electron } = window;
let volumeTimer: any;
let cursorTimer: any;
let timeoutTimer: any;
let hls: any;

function Container({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const nav = useNavigate();

  useEffect(() => {
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
  const nav = useNavigate();
  const [retryCount, setRetryCount] = useState(0);

  function changeVolume(dv: number) {
    if (videoRef.current) {
      const v = Math.max(0, Math.min(volume + dv, 20));
      if (stream && stream.file.includes('.m3u8'))
        videoRef.current.volume = v * 0.05;
      setVolume(v);
      setIsShowVolume(true);
      clearTimeout(volumeTimer);
      volumeTimer = setTimeout(() => setIsShowVolume(false), 1000);
    }
  }
  document.onkeydown = ({ key }) => {
    switch (key) {
      case 'r':
      case 'R':
        setRetryCount((c) => c + 1);
        break;
      case 'ArrowUp':
      case 'w':
      case 'W':
      case 'k':
      case 'K':
        changeVolume(1);
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
      case 'j':
      case 'J':
        changeVolume(-1);
        break;
      default:
      // no default
    }
  };
  useEffect(() => {
    hls = new Hls({ debug: false });
    (async () => {
      const { getStream } = await import(
        `../../../ext/extensions/${result.ext}`
      );

      const res = await getStream(result.path);
      if (res) setStreams(res);
      else nav(-1);
    })();

    return () => {
      console.log('destroy');
      hls.destroy();
      document.onkeydown = () => {};
      electron.ipcRenderer.sendMessage('change-referrer', null);
      electron.ipcRenderer.sendMessage('change-origin', null);
    };
  }, []);
  useDidMountEffect(() => {
    if (hls && videoRef.current && stream) {
      if (stream.file.includes('.m3u8')) {
        hls.loadSource(stream.file);
        hls.attachMedia(videoRef.current);
        // hls.on(Hls.Events.ERROR, (_, data) => console.log('hlsErr', data.type));
        videoRef.current.volume = 0.5;
        videoRef.current.play();
      }
    }
  }, [streams, streamIdx, retryCount]);

  if (!stream) return <Container> </Container>;
  return (
    <Container>
      {/* eslint-disable-next-line */}
      <video
        onTimeUpdate={() => {
          clearTimeout(timeoutTimer);
          timeoutTimer = setTimeout(() => setRetryCount((c) => c + 1), 4000);
        }}
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
