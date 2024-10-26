import useDidMountEffect from '@components/useDidMountEffect';
import { Result } from '@types';
import Hls from 'hls.js';
import buttonStyles from '@styles/Button.module.css';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './styles.module.css';

let volumeTimer: any;

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

  useEffect(() => {
    (async () => {
      const { getStream } = await import(
        `../../../ext/extensions/${result.ext}`
      );

      const res = await getStream(result.path);
      if (res) setStreams(res);
      else nav(-1);
    })();
  }, []);
  useDidMountEffect(() => {
    if (videoRef.current && stream) {
      if (stream.file.includes('.m3u8')) {
        console.log(stream);
        hls.loadSource(stream.file);
        hls.attachMedia(videoRef.current);
        hls.on(Hls.Events.ERROR, (_, data) => console.log('hlsErr', data.type));
      }

      // videoRef.current.currentTime = episode.currentTime;
      // videoRef.current.volume = settings.volume * 0.05;
      // videoRef.current.playbackRate = settings.playbackRate;
      videoRef.current.play();
    }
  }, [streamIdx, streams, videoRef.current]);

  function changeVolume(dv: number) {
    if (videoRef.current) {
      const v = Math.max(0, Math.min(volume + dv, 20));
      videoRef.current.volume = v * 0.05;
      setVolume(v);
      setIsShowVolume(true);
      clearTimeout(volumeTimer);
      volumeTimer = setTimeout(() => setIsShowVolume(false), 1000);
    }
  }

  if (stream)
    return (
      <Container>
        {/* eslint-disable-next-line */}
        <video
          src={stream.file}
          ref={videoRef}
          onWheel={({ deltaY }) => changeVolume(deltaY < 0 ? 1 : -1)}
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
