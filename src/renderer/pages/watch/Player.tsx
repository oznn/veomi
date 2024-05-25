/* eslint jsx-a11y/media-has-caption: off */
import Hls from 'hls.js';
import { useEffect, useRef, useState } from 'react';
import { Entry, Video } from '../../types';
import Settings from './Settings';

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
  function playAndPause() {
    if (videoRef.current) {
      if (videoRef.current.paused) videoRef.current.play();
      else {
        videoRef.current.pause();
        const { currentTime } = videoRef.current;
        store.set(`${episodeKey}.progress`, currentTime);
      }
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
      const { currentTime, duration, ended } = videoRef.current;
      const time = Math.floor(currentTime);
      const progressPercent = Math.floor((currentTime / duration) * 100);

      if (ended) next();
      if (time % 60 === 0) store.set(`${episodeKey}.progress`, time);
      if (entry.isSkip.intro) skip('intro', time);
      if (entry.isSkip.outro) skip('outro', time);
      if (!entry.episodes[episode].isSeen && progressPercent >= 85)
        store.set(`${episodeKey}.isSeen`, true);

      seekerRef.current.value = `${progressPercent}`;
      setProgress(time);
      if (isVideoLoading) setIsVideoLoading(false);
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
    if (target.getBoundingClientRect().width / 2 > x) prev();
    else next();
  }

  return (
    <div>
      {isVideoLoading && <h3>loading...</h3>}
      <video
        ref={videoRef}
        onClick={playAndPause}
        onTimeUpdate={update}
        onWaiting={() => setIsVideoLoading(true)}
        width={1000}
        onWheel={({ deltaY }) => changeVolume(deltaY * -0.01)}
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
      <br />
      {formatTime(progress)}
      <input
        type="range"
        defaultValue={0}
        ref={seekerRef}
        step={1}
        onChange={seek}
      />
      <button type="button" onClick={prev} disabled={episode === 0}>
        prev
      </button>
      <button
        type="button"
        onClick={next}
        disabled={episode === entry.episodes.length - 1}
      >
        next
      </button>
      <h4>volume {volume * 10}%</h4>
      <Settings entry={entry} />
    </div>
  );
}
