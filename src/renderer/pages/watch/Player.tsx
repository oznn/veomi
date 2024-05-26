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
  prev: () => void;
};

function formatTime(s: number) {
  const seconds = s % 60 < 10 ? `0${s % 60}` : s % 60;
  const minutes = `${Math.floor((s / 60) % 60)}:`;
  const hours = s / 3600 >= 1 ? `${Math.floor(s / 3600)}:` : '';

  return hours + minutes + seconds;
}
export default function Player({ video, entry, episode, next, prev }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const src = video.sources[0].file;
  const track = video.tracks[0];
  const { skips } = video;
  const episodeKey = `entries.${entry.key}.episodes.${episode}`;
  const seekerRef = useRef<HTMLInputElement>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(5);
  const [isShowSettings, setIsShowSettings] = useState(false);

  useEffect(() => {
    (async () => {
      const hls = new Hls({
        debug: false,
      });

      const fileType = src.slice(src.lastIndexOf('.') + 1, src.length);
      if (videoRef.current) {
        if (Hls.isSupported() && fileType === 'm3u8') {
          // hls.log = true;
          hls.loadSource(src);
          hls.attachMedia(videoRef.current);
          hls.on(Hls.Events.ERROR, (err) => {
            console.log(err);
          });
        }
        const storedVolume = await store.get(`entries.${entry.key}.volume`);
        const storedProgress = await store.get(`${episodeKey}.progress`);

        setVolume(storedVolume ?? 5);
        videoRef.current.volume =
          typeof storedVolume === 'number' ? storedVolume * 0.1 : 0.5;
        videoRef.current.currentTime = storedProgress;
        videoRef.current.focus();
        videoRef.current.play();
      }
    })();
  }, [src]);

  function seek() {
    if (videoRef.current && seekerRef.current) {
      const seekedProgress =
        (Number(seekerRef.current.value) / 100) * videoRef.current.duration;
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
      const progressPercent = Math.floor((currentTime / duration) * 100);

      if (Math.floor(currentTime) % 60 === 0)
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
      v = Math.max(0, Math.min(volume + v, 10)); // eslint-disable-line
      videoRef.current.volume = v * 0.1;
      store.set(`entries.${entry.key}.volume`, v);
      setVolume(v);
    }
  }
  function navigate(target: HTMLVideoElement, x: number) {
    const { width } = target.getBoundingClientRect();
    if (width / 2 < x && episode < entry.episodes.length - 1) next();
    if (width / 2 > x && episode > 0) prev();
  }
  function handleKeyEvents(key: string) {
    if (videoRef.current)
      switch (key) {
        case 'ArrowRight':
          videoRef.current.currentTime = Math.min(
            videoRef.current.duration,
            videoRef.current.currentTime + 5,
          );
          break;
        case 'ArrowLeft':
          videoRef.current.currentTime = Math.max(
            0,
            videoRef.current.currentTime - 5,
          );
          break;
        case 'ArrowUp':
          changeVolume(1);
          break;
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
    <div>
      {isVideoLoading && <h3 className={styles.loading}>loading...</h3>}
      <video
        tabIndex={0}
        ref={videoRef}
        onClick={playPause}
        onTimeUpdate={update}
        onEnded={next}
        onWaiting={() => setIsVideoLoading(true)}
        onPlaying={() => setIsVideoLoading(false)}
        onPause={handlePause}
        onWheel={({ deltaY }) => changeVolume(deltaY * -0.01)}
        onKeyDown={({ key }) => handleKeyEvents(key)}
        onAuxClick={({ target, clientX }) =>
          navigate(target as HTMLVideoElement, clientX)
        }
      >
        <source src={src} />
        {track && (
          <track
            label={track.label}
            kind={track.caption}
            src={track.file}
            default
          />
        )}
      </video>

      <Settings entry={entry} isShow={isShowSettings} />
      <div className={styles.footer}>
        {videoRef.current && videoRef.current.duration
          ? formatTime(Math.floor(videoRef.current.duration - progress))
          : '0:00'}
        <input
          type="range"
          defaultValue={0}
          ref={seekerRef}
          step={0.1}
          onChange={seek}
        />
        <button
          type="button"
          onClick={() => setIsShowSettings(!isShowSettings)}
        >
          Settings
        </button>
      </div>
    </div>
  );
}
