/* eslint jsx-a11y/media-has-caption: off */
import Hls from 'hls.js';
import { useEffect, useRef, useState } from 'react';
import { Entry, Video } from '../../types';
import Settings from './Settings';
import ProgressBar from './ProgressBar';
import { formatTime } from './utils';
import styles from '../../styles/Watch.module.css';
import loadingStyles from '../../styles/Loading.module.css';
import cog from '../../../../assets/cog.png';

const {
  electron: { store },
} = window;
type Props = {
  video: Video;
  entry: Entry;
  episode: number;
  isShowServers: boolean;
  setIsShowServers: (b: boolean) => void;
  next: () => void;
};

const { floor, max, min } = Math;
let cursorTimer: any;
let volumeTimer: any;

export default function Player({
  video,
  entry,
  episode,
  isShowServers,
  setIsShowServers,
  next,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { sources, tracks, skips } = video;
  const episodeKey = `entries.${entry.key}.episodes.${episode}`;
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [isShowSettings, setIsShowSettings] = useState(false);
  const f = ({ qual }: { qual: number }) =>
    qual === entry.settings.preferredQual;
  const preferredSrcIdx = sources.findIndex(f);
  const [srcIdx, setSrcIdx] = useState(Math.max(0, preferredSrcIdx));
  const src = sources[srcIdx];
  const [trackIdx, setTrackIdx] = useState(-1);
  // const track = tracks[trackIdx];
  const [progress, setProgress] = useState(entry.episodes[episode].progress);
  const [volume, setVolume] = useState(entry.settings.volume);
  const [isShowVolume, setIsShowVolume] = useState(false);
  const [isShowCursor, setIsShowCursor] = useState(false);

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
        if (tracks) {
          const preferredTrackIdx = tracks.findIndex(
            ({ label }) => label?.includes(entry.settings.preferredSubs),
          );

          setTrackIdx(preferredTrackIdx);
        }
        videoRef.current.currentTime = progress;
        videoRef.current.volume = volume * 0.05;
        videoRef.current.focus();
        videoRef.current.play();
      }
    })();
  }, [src]);
  useEffect(() => {
    entry.settings.preferredQual = sources[srcIdx].qual;
    store.set(
      `entries.${entry.key}.settings.preferredQual`,
      sources[srcIdx].qual,
    );
  }, [srcIdx]);
  useEffect(() => {
    if (tracks && trackIdx > -1) {
      entry.settings.preferredSubs = tracks[trackIdx].label.split(' ')[0]; //eslint-disable-line
      store.set(
        `entries.${entry.key}.settings.preferredSubs`,
        tracks[trackIdx].label.split(' ')[0],
      );
    }
  }, [trackIdx]);

  function playPause() {
    if (videoRef.current) {
      if (videoRef.current.paused) videoRef.current.play();
      else if (!isShowSettings && !isShowServers) videoRef.current.pause();
    }
    setIsShowServers(false);
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
      if (isSkip) videoRef.current.currentTime = skips[part][1]; // eslint-disable-line
    }
  }
  function update() {
    if (videoRef.current) {
      const { currentTime, duration } = videoRef.current;
      const progressPercent = (currentTime / duration) * 100;

      if (currentTime > 0 && floor(currentTime) % 10 === 0)
        store.set(`${episodeKey}.progress`, currentTime);
      if (entry.settings.isSkip.intro) skip('intro', currentTime);
      if (entry.settings.isSkip.outro) skip('outro', currentTime);
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
      entry.settings.volume = v;
      store.set(`entries.${entry.key}.settings.volume`, v);
      setVolume(v);
      setIsShowVolume(true);
      clearTimeout(volumeTimer);
      volumeTimer = setTimeout(() => setIsShowVolume(false), 1000);
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
    const g = ({ key }: { key: string }) => handleKeyEvents(key);
    window.addEventListener('keydown', g);
    return () => window.removeEventListener('keydown', g);
  });

  return (
    <>
      {isVideoLoading && (
        <div className={`${loadingStyles.container} ${styles.loading}`} />
      )}
      <video
        tabIndex={0}
        ref={videoRef}
        style={{ cursor: isShowCursor ? 'auto' : 'none' }}
        onClick={playPause}
        onTimeUpdate={update}
        onPause={handlePause}
        onAuxClick={({ button }) => {
          if (button === 2) next();
          else document.exitFullscreen();
        }}
        onWaiting={() => setIsVideoLoading(true)}
        onPlaying={() => setIsVideoLoading(false)}
        onWheel={({ deltaY }) => changeVolume(deltaY < 0 ? 1 : -1)}
        onEnded={() => {
          store.set(`${episodeKey}.progress`, 0);
          next();
        }}
        onMouseMove={() => {
          setIsShowCursor(true);
          clearTimeout(cursorTimer);
          cursorTimer = setTimeout(() => setIsShowCursor(false), 2000);
        }}
      >
        <source src={src.file} />
        {tracks && trackIdx > -1 && (
          <track
            src={tracks[trackIdx].file}
            label={tracks[trackIdx].label}
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
        {videoRef && (
          <ProgressBar
            videoRef={videoRef}
            setProgress={(n: number) => setProgress(n)}
          />
        )}
        <img // eslint-disable-line
          className={styles.cog}
          src={cog}
          alt="settings"
          onClick={() => setIsShowSettings(!isShowSettings)}
          width={40}
        />
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
