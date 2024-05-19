/* eslint no-console: off, jsx-a11y/media-has-caption: off */
import Hls from 'hls.js';
import { useEffect, useRef } from 'react';
import { Video, Entry } from '../../types';

const { electron } = window;
type Props = {
  video: Video;
  entry: Entry;
  ep: number;
};
export default function Player({ video, entry, ep }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const src = video.sources[0].file;
  const track = video.tracks[0];

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
      videoRef.current.currentTime = entry.episodes[ep].progress;
      videoRef.current.play();
    }
  }, [src]);

  function pp() {
    if (videoRef.current) {
      if (videoRef.current.paused) videoRef.current.play();
      else {
        videoRef.current.pause();
        entry.episodes[ep].progress = videoRef.current.currentTime;
        electron.send('store-set', entry.key, entry);
        console.log('progress saved');
      }
    }
  }
  return (
    <div>
      <video
        ref={videoRef}
        width={500}
        onClick={pp}
        onTimeUpdate={() => console.log(videoRef.current?.currentTime)}
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
    </div>
  );
}
