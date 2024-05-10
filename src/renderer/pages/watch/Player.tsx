/* eslint no-console: off, jsx-a11y/media-has-caption: off */
import Hls from 'hls.js';
import { useEffect, useRef } from 'react';

type Video = {
  sources: { file: string; qual: string }[];
  tracks: { file: string; label: string; caption: string }[];
  origin: string;
  skips: { intro: number[]; outro: number[] };
};
const { electron } = window;
export default function Player({ video }: { video: Video }) {
  electron.ipcRenderer.sendMessage('change-origin', video.origin);

  const videoRef = useRef<HTMLVideoElement>(null);
  const src = video.sources[0].file;
  const track = video.tracks[0];

  useEffect(() => {
    const hls = new Hls({
      debug: false,
    });

    const fileType = src.slice(src.lastIndexOf('.') + 1, src.length);
    if (Hls.isSupported() && videoRef.current && fileType === 'm3u8') {
      // hls.log = true;
      hls.loadSource(src);
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.ERROR, (err) => {
        console.log(err);
      });
    }
  }, [src]);

  return (
    <video ref={videoRef} controls autoPlay width={500}>
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
  );
}
