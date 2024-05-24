/* eslint jsx-a11y/media-has-caption: off */
import Hls from 'hls.js';
import { useEffect, useRef, useState } from 'react';
import { Entry, Video } from '../../types';

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
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const progressKey = `entries.${entry.key}.episodes.${episode}.progress`;

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
        const storedProgress = await electron.send('store-get', progressKey);
        videoRef.current.currentTime = storedProgress;
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
        electron.send('store-set', progressKey, currentTime);
      }
    }
  }
  function skip(part: 'intro' | 'outro', time: number) {
    if (videoRef.current) {
      const isSkip = time >= skips[part][0] && time <= skips[part][1];
      if (isSkip) videoRef.current.currentTime = skips[part][1];// eslint-disable-line
    }
  }
  function toggleIsSkip(part: 'intro' | 'outro', toggle: boolean) {
    entry.isSkip[part] = toggle;
    electron.send('store-set', `entries.${entry.key}.isSkip.${part}`, toggle);
  }
  function update() {
    if (videoRef.current && seekerRef.current) {
      const { currentTime, duration } = videoRef.current;

      if (entry.isSkip.intro) skip('intro', currentTime);
      if (entry.isSkip.outro) skip('outro', currentTime);
      seekerRef.current.value = `${(currentTime / duration) * 100}`;
      setProgress(currentTime);
      if (isVideoLoading) setIsVideoLoading(false);
    }
  }
  function seek() {
    if (videoRef.current && seekerRef.current) {
      const seekedProgress =
        (Number(seekerRef.current.value) / 100) * videoRef.current.duration;
      videoRef.current.currentTime = seekedProgress;
      setProgress(Math.floor(seekedProgress));
    }
  }
  function timeFormat(s: number) {
    const seconds = s % 60 < 10 ? `0${s % 60}` : s % 60;
    const minutes = `${Math.floor((s / 60) % 60)}:`;
    const hours = s / 3600 >= 1 ? `${Math.floor(s / 3600)}:` : '';

    return hours + minutes + seconds;
  }
  return (
    <div>
      {isVideoLoading && <h3>loading...</h3>}
      <video
        ref={videoRef}
        onClick={playback}
        onTimeUpdate={update}
        onWaiting={() => setIsVideoLoading(true)}
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
      <h3>{timeFormat(Math.floor(progress))}</h3>
      <input
        type="range"
        defaultValue={0}
        ref={seekerRef}
        step={1}
        onChange={seek}
      />
      <br />
      <label htmlFor="skipIntro">
        <input
          type="checkbox"
          onChange={({ target }) => toggleIsSkip('intro', target.checked)}
          id="skipIntro"
          defaultChecked={entry.isSkip.intro}
        />
        skip intro
      </label>
      <label htmlFor="skipOutro">
        <input
          type="checkbox"
          onChange={({ target }) => toggleIsSkip('outro', target.checked)}
          id="skipOutro"
          defaultChecked={entry.isSkip.outro}
        />
        skip outro
      </label>
    </div>
  );
}
