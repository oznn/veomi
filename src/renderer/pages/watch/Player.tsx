/* eslint jsx-a11y/media-has-caption: off */
import Hls from 'hls.js';
import { MouseEvent, useEffect, useRef, useState } from 'react';
import { Entry, Video } from '../../types';
import Settings from './Settings';
import styles from '../../styles/Watch.module.css';

const {
  electron: { store },
} = window;
type Props = {
  video: Video;
  entry: Entry;
  episode: number;
  next: () => void;
};

const { floor, max, min } = Math;
let timestampX = 0;
let progressPercent = 0;
let seekerBoundingClient: any;

function formatTime(t: number) {
  const s = t % 60;
  const m = floor((t / 60) % 60);
  const h = floor(t / 3600);
  const seconds = s < 10 ? `0${s}` : s;
  const minutes = h > 0 && m < 10 ? `0${m}:` : `${m}:`;
  const hours = h > 0 ? `${h}:` : '';

  return hours + minutes + seconds;
}
export default function Player({ video, entry, episode, next }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { sources, tracks, skips } = video;
  const episodeKey = `entries.${entry.key}.episodes.${episode}`;
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [isShowSettings, setIsShowSettings] = useState(false);
  const preferredSrcIdx = sources.findIndex(
    ({ qual }) => qual === entry.preferredQual,
  );
  const [srcIdx, setSrcIdx] = useState(
    preferredSrcIdx !== -1 ? preferredSrcIdx : 0,
  );
  const [trackIdx, setTrackIdx] = useState(-1);
  const src = sources[srcIdx];
  const track = tracks[trackIdx];
  const [progress, setProgress] = useState(entry.episodes[episode].progress);
  const [volume, setVolume] = useState(entry.volume);
  const [isShowVolume, setIsShowVolume] = useState(false);
  const [isShowCursor, setIsShowCursor] = useState(false);
  const [hoveredTimestamp, setHoveredTimestamp] = useState(0);

  useEffect(() => {
    (async () => {
      const hls = new Hls({
        debug: false,
      });

      const fileType = src.file.slice(
        src.file.lastIndexOf('.') + 1,
        src.file.length,
      );
      if (videoRef.current) {
        if (Hls.isSupported() && fileType === 'm3u8') {
          hls.loadSource(src.file);
          hls.attachMedia(videoRef.current);
          hls.on(Hls.Events.ERROR, (err) => {
            console.log(err);
          });
        }
        const preferredTrackIdx = tracks.findIndex(
          ({ label }) => label === entry.preferredSubs,
        );
        setTrackIdx(preferredTrackIdx);
        videoRef.current.currentTime = progress;
        videoRef.current.volume = volume * 0.05;
        videoRef.current.focus();
        videoRef.current.play();
      }
    })();
  }, [src]);
  useEffect(() => {
    entry.volume = volume;
    setIsShowVolume(true);
    const timeout = setTimeout(() => setIsShowVolume(false), 2000);

    return () => clearTimeout(timeout);
  }, [volume]);
  useEffect(() => {
    entry.preferredQual = sources[srcIdx].qual;
    store.set(`entries.${entry.key}.preferredQual`, sources[srcIdx].qual);
  }, [srcIdx]);
  useEffect(() => {
    if (trackIdx > -1) {
      entry.preferredSubs = tracks[trackIdx].label;
      store.set(`entries.${entry.key}.preferredSubs`, tracks[trackIdx].label);
    }
  }, [trackIdx]);

  function seek() {
    if (videoRef.current) {
      videoRef.current.currentTime = hoveredTimestamp;
      setProgress(hoveredTimestamp);
    }
  }
  function playPause() {
    if (videoRef.current) {
      if (videoRef.current.paused) videoRef.current.play();
      else if (!isShowSettings) videoRef.current.pause();
    }
    setIsShowSettings(false);
  }
  function handlePause() {
    if (videoRef.current) {
      const { currentTime } = videoRef.current;
      entry.episodes[episode].progress = currentTime;
      store.set(`${episodeKey}.progress`, currentTime);
      setIsVideoLoading(false);
    }
  }
  function skip(part: 'intro' | 'outro', time: number) {
    if (videoRef.current) {
      const isSkip = time >= skips[part][0] && time < skips[part][1];
      if (isSkip) videoRef.current.currentTime = skips[part][1];// eslint-disable-line
    }
  }
  function update() {
    if (videoRef.current) {
      const { currentTime, duration } = videoRef.current;
      const progressPercent = (currentTime / duration) * 100;

      if (currentTime > 0 && floor(currentTime) % 10 === 0)
        store.set(`${episodeKey}.progress`, currentTime);
      if (entry.isSkip.intro) skip('intro', currentTime);
      if (entry.isSkip.outro) skip('outro', currentTime);
      if (!entry.episodes[episode].isSeen && progressPercent >= 85)
        store.set(`${episodeKey}.isSeen`, true);

      entry.episodes[episode].progress = progress;
      setProgress(currentTime);
    }
  }
  function changeVolume(v: number) {
    if (videoRef.current) {
      v = max(0, min(volume + v, 20)); // eslint-disable-line
      videoRef.current.volume = v * 0.05;
      store.set(`entries.${entry.key}.volume`, v);
      setVolume(v);
    }
  }
  function handleKeyEvents(key: string) {
    if (videoRef.current)
      switch (key) {
        case 'l':
        case 'ArrowRight':
          videoRef.current.currentTime = min(
            videoRef.current.duration,
            videoRef.current.currentTime + 5,
          );
          break;
        case 'h':
        case 'ArrowLeft':
          videoRef.current.currentTime = max(
            0,
            videoRef.current.currentTime - 5,
          );
          break;
        case 'k':
        case 'ArrowUp':
          changeVolume(1);
          break;
        case 'j':
        case 'ArrowDown':
          changeVolume(-1);
          break;
        case ' ':
          playPause();
          break;
        default:
        // no default
      }
  }

  useEffect(() => {
    let timeout: any;
    if (isShowCursor) timeout = setTimeout(() => setIsShowCursor(false), 3000);

    return () => clearTimeout(timeout);
  }, [isShowCursor]);

  if (videoRef.current)
    progressPercent =
      (videoRef.current.currentTime / videoRef.current.duration) * 100;

  function updateHoveredTimestamp(e: MouseEvent) {
    if (!seekerBoundingClient)
      seekerBoundingClient = (
        e.target as HTMLSpanElement
      ).getBoundingClientRect();

    if (videoRef.current) {
      const { left, right } = seekerBoundingClient;
      const { duration } = videoRef.current;
      const normalizer = (e.clientX - left) / (right - left);

      timestampX = e.clientX - left;
      setHoveredTimestamp(floor(duration * max(0, min(normalizer, 1))));
    }
  }

  return (
    <>
      {isVideoLoading && <h3 className={styles.loading}>LOADING</h3>}
      <video
        tabIndex={0}
        ref={videoRef}
        style={{ cursor: isShowCursor ? 'auto' : 'none' }}
        onClick={playPause}
        onTimeUpdate={update}
        onPause={handlePause}
        onKeyDown={({ key }) => handleKeyEvents(key)}
        onAuxClick={({ button }) => {
          if (button === 2) next();
          else document.exitFullscreen();
        }}
        onWaiting={() => setIsVideoLoading(true)}
        onPlaying={() => setIsVideoLoading(false)}
        onWheel={({ deltaY }) => changeVolume(deltaY * -0.01)}
        onEnded={() => {
          store.set(`${episodeKey}.progress`, 0);
          next();
        }}
        onMouseMove={() => setIsShowCursor(true)}
      >
        <source src={src.file} />
        {track && (
          <track
            label={track.label}
            kind={track.caption}
            src={track.file}
            default
          />
        )}
      </video>
      <div className={styles.controls}>
        <span>
          {videoRef.current && videoRef.current.duration
            ? formatTime(floor(videoRef.current.duration - progress))
            : '0:00'}
        </span>
        <div // eslint-disable-line
          className={styles.seeker}
          onMouseMove={(e) => updateHoveredTimestamp(e)}
          onClick={seek}
        >
          <span>
            <span
              style={{
                width: `${progressPercent}%`,
              }}
            />
          </span>
          <span style={{ left: `${progressPercent}%` }} />
          <span style={{ left: `${timestampX}px` }}>
            {formatTime(hoveredTimestamp)}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsShowSettings(!isShowSettings)}
        >
          Settings
        </button>
      </div>
      <div className={styles.volume} style={{ opacity: isShowVolume ? 1 : 0 }}>
        {volume * 5}%
      </div>
      {videoRef && isShowSettings && (
        <Settings
          entry={entry}
          video={video}
          srcIdx={srcIdx}
          trackIdx={trackIdx}
          setSrcIdx={(i: number) => setSrcIdx(i)}
          setTrackIdx={(i: number) => setTrackIdx(i)}
        />
      )}
    </>
  );
}
