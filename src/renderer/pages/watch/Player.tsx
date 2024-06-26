/* eslint jsx-a11y/media-has-caption: off */
import Hls from 'hls.js';
import { useEffect, useRef, useState } from 'react';
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

function formatTime(s: number) {
  const seconds = s % 60 < 10 ? `0${s % 60}` : s % 60;
  const minutes = `${Math.floor((s / 60) % 60)}:`;
  const hours = s / 3600 >= 1 ? `${Math.floor(s / 3600)}:` : '';

  return hours + minutes + seconds;
}
export default function Player({ video, entry, episode, next }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { skips } = video;
  const episodeKey = `entries.${entry.key}.episodes.${episode}`;
  const seekerRef = useRef<HTMLInputElement>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [isShowSettings, setIsShowSettings] = useState(false);
  const [srcIdx, setSrcIdx] = useState(0);
  const [trackIdx, setTrackIdx] = useState(-1);
  const src = video.sources[srcIdx];
  const track = video.tracks[trackIdx];
  const [progress, setProgress] = useState(entry.episodes[episode].progress);
  const [volume, setVolume] = useState(entry.volume);
  const [isShowVolume, setIsShowVolume] = useState(false);

  useEffect(() => {
    (async () => {
      const hls = new Hls({
        debug: false,
      });

      const fileType = src.file.slice(
        src.file.lastIndexOf('.') + 1,
        src.file.length,
      );
      if (videoRef.current && seekerRef.current) {
        if (Hls.isSupported() && fileType === 'm3u8') {
          hls.loadSource(src.file);
          hls.attachMedia(videoRef.current);
          hls.on(Hls.Events.ERROR, (err) => {
            console.log(err);
          });
        }
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
    entry.episodes[episode].progress = progress;
  }, [progress]);
  function seek() {
    if (videoRef.current && seekerRef.current) {
      const { value } = seekerRef.current;
      const seekedProgress = (Number(value) / 100) * videoRef.current.duration;
      videoRef.current.currentTime = seekedProgress;
      setProgress(Math.floor(seekedProgress));
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
    if (videoRef.current && seekerRef.current) {
      const { currentTime, duration } = videoRef.current;
      const progressPercent = (currentTime / duration) * 100;

      if (currentTime > 0 && Math.floor(currentTime) % 15 === 0)
        store.set(`${episodeKey}.progress`, currentTime);
      if (entry.isSkip.intro) skip('intro', currentTime);
      if (entry.isSkip.outro) skip('outro', currentTime);
      if (!entry.episodes[episode].isSeen && progressPercent >= 85)
        store.set(`${episodeKey}.isSeen`, true);

      seekerRef.current.value = `${progressPercent}`;
      setProgress(currentTime);
    }
  }
  function changeVolume(v: number) {
    if (videoRef.current) {
      v = Math.max(0, Math.min(volume + v, 20)); // eslint-disable-line
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
          videoRef.current.currentTime = Math.min(
            videoRef.current.duration,
            videoRef.current.currentTime + 5,
          );
          break;
        case 'h':
        case 'ArrowLeft':
          videoRef.current.currentTime = Math.max(
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

  return (
    <>
      {isVideoLoading && <h3 className={styles.loading}>LOADING</h3>}
      <video
        tabIndex={0}
        style={{ cursor: videoRef?.current?.paused ? 'auto' : 'none' }}
        ref={videoRef}
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
            ? formatTime(Math.floor(videoRef.current.duration - progress))
            : '0:00'}
        </span>
        <input type="range" ref={seekerRef} step={0.1} onChange={seek} />
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
