/* eslint jsx-a11y/media-has-caption: off */
import Hls from 'hls.js';
import { useEffect, useRef, useState } from 'react';
import { Video, Entry } from '../../types';

const { electron } = window;
type Props = {
  video: Video;
  entry: Entry;
  episode: number;
};
export default function Player({ video, entry, episode }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const seekerRef = useRef<HTMLInputElement>(null);
  const src = video.sources[0].file;
  const track = video.tracks[0];
  const { skips } = video;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
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
      videoRef.current.currentTime = entry.episodes[episode].progress;
      videoRef.current.play();
    }
  }, [src]);

  function playback() {
    if (videoRef.current) {
      if (videoRef.current.paused) videoRef.current.play();
      else {
        videoRef.current.pause();
        entry.episodes[episode].progress = videoRef.current.currentTime;
        electron.send('store-set', entry.key, entry);
      }
    }
  }
  function update() {
    if (videoRef.current && seekerRef.current) {
      const { currentTime } = videoRef.current;
      const isInIntro =
        currentTime >= skips.intro[0] && currentTime <= skips.intro[1];
      const isInOutro =
        currentTime >= skips.outro[0] && currentTime <= skips.outro[1];
      if (isInIntro) videoRef.current.currentTime = skips.intro[1];// eslint-disable-line
      if (isInOutro) videoRef.current.currentTime = skips.outro[1];// eslint-disable-line
      seekerRef.current.value = `${
        (currentTime / videoRef.current.duration) * 100
      }`;
      setProgress(currentTime);
    }
  }
  function seek() {
    if (videoRef.current && seekerRef.current) {
      videoRef.current.currentTime =
        (Number(seekerRef.current.value) / 100) * videoRef.current.duration;
    }
  }
  function timeFormat(s: number) {
    const minutes = s / 60;
    const hours = minutes / 60;
    const m = minutes > 0 ? `${Math.floor(minutes)}:` : '';
    const h = hours > 0 ? `${Math.floor(hours)}:` : '';

    return h + m + (s % 60);
  }
  return (
    <div>
      <video
        ref={videoRef}
        onClick={playback}
        onTimeUpdate={update}
        width={500}
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
      <h1>{timeFormat(Math.floor(progress))}</h1>
      <input type="range" ref={seekerRef} step={1} onChange={seek} />
      <br />
    </div>
  );
}
