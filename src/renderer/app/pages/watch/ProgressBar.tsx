import { PlayerSettings } from '@types';
import { MouseEvent, useState, useRef, useEffect, RefObject } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../redux/store';
import { setEpisodeCurrentTime } from '../../redux';
import styles from './ProgressBar.module.css';

let timestampPercent = 0;
let seekerBoundingClient: any;
let isMouseDown = false;

const minmax = (a: number, b: number, c: number) => Math.max(a, Math.min(b, c));

function formatTime(t: number) {
  const s = t % 60;
  const m = Math.floor((t / 60) % 60);
  const h = Math.floor(t / 3600);
  const seconds = s < 10 ? `0${s}` : s;
  const minutes = h > 0 && m < 10 ? `0${m}:` : `${m}:`;
  const hours = h > 0 ? `${h}:` : '';

  return hours + minutes + seconds;
}

type Props = {
  videoRef: RefObject<HTMLVideoElement>;
};

export default function ProgressBar({ videoRef }: Props) {
  const dispatch = useDispatch();
  const { entry, mediaIdx } = useAppSelector((state) => state.app);
  const settings = entry?.settings as PlayerSettings;
  const seekerRef = useRef<HTMLDivElement>(null);
  const [hoveredTimestamp, setHoveredTimestamp] = useState(0);

  function timeJump(n: number) {
    if (videoRef.current)
      videoRef.current.currentTime = minmax(
        0,
        videoRef.current.currentTime + n,
        videoRef.current.duration,
      );
  }

  function seek() {
    if (videoRef.current) {
      videoRef.current.currentTime = hoveredTimestamp;
      dispatch(setEpisodeCurrentTime({ mediaIdx, time: hoveredTimestamp }));
    }
  }

  function updateHoveredTimestamp(e: MouseEvent) {
    if (!seekerBoundingClient)
      seekerBoundingClient = (
        e.target as HTMLSpanElement
      ).getBoundingClientRect();

    if (videoRef.current) {
      const { left, right } = seekerBoundingClient;
      const { duration } = videoRef.current;
      const normalizer = (e.clientX - left) / (right - left);

      timestampPercent = normalizer * 100;
      setHoveredTimestamp(
        Math.floor(duration * Math.max(0, Math.min(normalizer, 1))),
      );
      if (isMouseDown) seek();
    }
  }
  useEffect(() => {
    window.onmousedown = () => (isMouseDown = true); //eslint-disable-line
    window.onmouseup = () => (isMouseDown = false); //eslint-disable-line

    if (!seekerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (seekerRef.current) {
        seekerBoundingClient = seekerRef.current.getBoundingClientRect();
      }
    });
    resizeObserver.observe(seekerRef.current);

    return () => resizeObserver.disconnect(); //eslint-disable-line
  }, [seekerRef.current]);

  if (!videoRef.current) return '';

  const { currentTime, duration } = videoRef.current;
  const progressPercent = (currentTime / duration) * 100;

  return (
    <div className={styles.container}>
      {/* eslint-disable-next-line */}
      <div
        className={styles.bar}
        onMouseMove={(e) => updateHoveredTimestamp(e)}
        onClick={seek}
        ref={seekerRef}
      >
        <span className={styles.progress}>
          <span
            style={{
              scale: `${progressPercent * 0.01} 1`,
            }}
          />
        </span>
        <span
          className={styles.thumb}
          style={{ left: `${progressPercent}%` }}
        />
        <span
          className={styles.markPercent}
          style={{ left: `${settings.markAsSeenPercent}%` }}
        />
        <span
          className={styles.timestamp}
          style={{ left: `${timestampPercent}%` }}
        >
          {formatTime(hoveredTimestamp)}
        </span>
      </div>
      <div className={styles.time}>
        <span>{formatTime(Math.floor(currentTime))}</span>
        <div style={{ gap: '10px', display: 'flex', alignItems: 'center' }}>
          <button
            onKeyUp={(e) => e.preventDefault()}
            type="button"
            onClick={() => timeJump(-settings.timeJump)}
          >
            -{settings.timeJump}s
          </button>
          <button
            onKeyUp={(e) => e.preventDefault()}
            type="button"
            onClick={() => timeJump(-5)}
          >
            -5s
          </button>
          <button
            onKeyUp={(e) => e.preventDefault()}
            type="button"
            onClick={() => timeJump(-1 / 24)}
          >
            -1f
          </button>
          <span
            style={{
              width: '12px',
              height: '12px',
              backgroundColor: 'silver',
              margin: '0px 10px 5px 10px',
              borderRadius: videoRef.current.paused ? '50%' : '0',
              transition: 'all 300ms ease',
            }}
          />
          <button
            onKeyUp={(e) => e.preventDefault()}
            type="button"
            onClick={() => timeJump(1 / 24)}
          >
            +1f
          </button>
          <button
            onKeyUp={(e) => e.preventDefault()}
            type="button"
            onClick={() => timeJump(5)}
          >
            +5s
          </button>
          <button
            onKeyUp={(e) => e.preventDefault()}
            type="button"
            onClick={() => timeJump(settings.timeJump)}
          >
            +{settings.timeJump}s
          </button>
        </div>
        <span>{formatTime(Math.floor(duration))}</span>
      </div>
    </div>
  );
}
