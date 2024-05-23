/* eslint jsx-a11y/media-has-caption: off */
import Hls from 'hls.js';
import { useEffect, useRef, useState } from 'react';
import { Video } from '../../types';

const { electron } = window;
type Props = {
  video: Video;
  entryKey: string;
  episode: number;
};
export default function Player({ video, entryKey, episode }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const seekerRef = useRef<HTMLInputElement>(null);
  const src = video.sources[0].file;
  const track = video.tracks[0];
  const { skips } = video;
  const [progress, setProgress] = useState(0);
  const episodeKey = `entries.${entryKey}.episodes.${episode}`;

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
        videoRef.current.currentTime = await electron.send(
          'store-get',
          `${episodeKey}.progress`,
        );
        videoRef.current.play();
      }
    })();
  }, [src]);

  function playback() {
    if (videoRef.current) {
      if (videoRef.current.paused) videoRef.current.play();
      else {
        videoRef.current.pause();
        const { currentTime } = videoRef.current;
        electron.send('store-set', `${episodeKey}.progress`, currentTime);
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
    const seconds = s < 10 ? `0${s % 60}` : s % 60;
    const minutes = `${Math.floor((s / 60) % 60)}:`;
    const hours = s / 3600 >= 1 ? `${Math.floor(s / 3600)}:` : '';

    return hours + minutes + seconds;
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
      <input type="range" value={0} ref={seekerRef} step={1} onChange={seek} />
      <br />
    </div>
  );
}
