import { MouseEvent, useState, useRef, useEffect, RefObject } from 'react';
import { formatTime } from './utils';
import styles from '../../styles/Watch.module.css';

let timestampPercent = 0;
let seekerBoundingClient: any;
const { floor, min, max } = Math;

type Props = {
  videoRef: RefObject<HTMLVideoElement>;
  setProgress: (n: number) => void;
};
export default function ProgressBar({ videoRef, setProgress }: Props) {
  const seekerRef = useRef<HTMLDivElement>(null);
  const [hoveredTimestamp, setHoveredTimestamp] = useState(0);

  function seek() {
    if (videoRef.current) {
      videoRef.current.currentTime = hoveredTimestamp;
      setProgress(hoveredTimestamp);
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
      setHoveredTimestamp(floor(duration * max(0, min(normalizer, 1))));
    }
  }
  useEffect(() => {
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
    <div // eslint-disable-line
      className={styles.seeker}
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
      <span className={styles.thumb} style={{ left: `${progressPercent}%` }} />
      <span
        className={styles.timestamp}
        style={{ left: `${timestampPercent}%` }}
      >
        {formatTime(hoveredTimestamp)}
      </span>
      <span className={styles.intro} />
    </div>
  );
}
