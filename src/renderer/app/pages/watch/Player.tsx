import Hls from 'hls.js';
import { WebVTTParser } from 'webvtt-parser';
import Loading from '@components/loading';
import { useDispatch } from 'react-redux';
import { Video, Entry, Server } from '@types';
import { useEffect, useRef, useState } from 'react';
import ProgressBar from './ProgressBar';
import { useAppSelector } from '../../redux/store';
import {
  setEpisodeCurrentTime,
  setVolume,
  setEpisodeIdx,
  serverRetry,
} from '../../redux';
import Context from './Context';
import styles from './styles.module.css';

const { electron } = window;
const parser = new WebVTTParser();
let cursorTimer: any;
let volumeTimer: any;
type TextTrack = { start: number; end: number; text: string };

export default function Player() {
  const dispatch = useDispatch();
  const app = useAppSelector((state) => state.app);
  const entry = app.entry as Entry;
  const video = app.video as Video;
  const server = app.server as { list: Server[]; idx: number };
  const { episodeIdx, sourceIdx, trackIdx } = app;
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const source = video.sources[sourceIdx];
  const track = video.tracks ? video.tracks[trackIdx] : null;
  const episode = entry.episodes[episodeIdx];
  const episodeKey = `entries.${entry.key}.episodes.${episodeIdx}`;
  const [isShowCursor, setIsShowCursor] = useState(false);
  const [isShowVolume, setIsShowVolume] = useState(false);
  const [context, setContext] = useState({ isShow: false, x: 0, y: 0 });
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [textTracks, setTextTracks] = useState<TextTrack[] | null>(null);
  const hls = new Hls({ debug: false });

  function changeVolume(v: number) {
    if (videoRef.current) {
      const volume = Math.max(0, Math.min(entry.settings.volume + v, 20));
      videoRef.current.volume = volume * 0.05;
      dispatch(setVolume(volume));
      setIsShowVolume(true);
      clearTimeout(volumeTimer);
      volumeTimer = setTimeout(() => setIsShowVolume(false), 1000);
    }
  }
  function playPause() {
    if (videoRef.current) {
      if (videoRef.current.paused) videoRef.current.play();
      else if (!context.isShow) videoRef.current.pause();
    }
    setContext({ isShow: false, x: 0, y: 0 });
  }
  document.onkeydown = ({ key }) => {
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
        case 'K':
        case 'ArrowUp':
          changeVolume(1);
          break;
        case 'j':
        case 'J':
        case 'ArrowDown':
          changeVolume(-1);
          break;
        case ' ':
          playPause();
          break;
        case 'n':
        case 'N':
          dispatch(
            setEpisodeIdx(Math.min(entry.episodes.length - 1, episodeIdx + 1)),
          );
          break;
        case 'p':
        case 'P':
          dispatch(setEpisodeIdx(Math.max(0, episodeIdx - 1)));
          break;
        case 'e':
        case 'E':
          document.exitFullscreen();
          break;
        default:
        // no default
      }
  };

  useEffect(() => {
    window.ononline = () => dispatch(serverRetry());
    if (videoRef.current) {
      if (source.file.includes('.m3u8')) {
        console.log('source file', source.file);
        hls.loadSource(source.file);
        hls.attachMedia(videoRef.current);
        hls.on(Hls.Events.ERROR, (_, data) => console.log('hlsErr', data.type));
      }

      videoRef.current.currentTime = episode.currentTime;
      videoRef.current.volume = entry.settings.volume * 0.05;
      videoRef.current.playbackRate = entry.settings.playbackRate;
      videoRef.current.play();
    }
    return () => {
      hls.destroy();
      window.ononline = () => {};
    };
  }, [source]);
  useEffect(() => {
    (async () => {
      if (track) {
        const vtt = await (await fetch(track.file)).text();
        const { cues } = parser.parse(vtt, 'metadata');
        setTextTracks(
          cues.map((t) => ({
            start: t.startTime,
            end: t.endTime,
            text: t.text,
          })),
        );
      }
    })();
  }, [trackIdx]);
  useEffect(() => {
    if (videoRef.current)
      videoRef.current.playbackRate = entry.settings.playbackRate;
  }, [entry.settings.playbackRate]);

  function skip(part: 'intro' | 'outro', time: number) {
    const { skips } = video;
    if (skips && videoRef.current) {
      const isSkip = time >= skips[part][0] && time < skips[part][1];
      if (isSkip) videoRef.current.currentTime = skips[part][1]; // eslint-disable-line
    }
  }

  function update() {
    if (videoRef.current) {
      const { currentTime, duration } = videoRef.current;
      const progressPercent = (currentTime / duration) * 100;

      if (currentTime > 0 && Math.floor(currentTime) % 5 === 0)
        electron.store.set(`${episodeKey}.currentTime`, currentTime);
      if (entry.settings.isAutoSkip.intro) skip('intro', currentTime);
      if (entry.settings.isAutoSkip.outro) skip('outro', currentTime);
      if (
        !episode.isSeen &&
        progressPercent >= entry.settings.markAsSeenPercent
      )
        electron.store.set(`${episodeKey}.isSeen`, true);
      dispatch(
        setEpisodeCurrentTime({
          episodeIdx,
          time: videoRef.current.currentTime,
        }),
      );
    }
  }

  const currentTime = videoRef.current ? videoRef.current.currentTime : 0;

  return (
    <div className={styles.container} ref={containerRef}>
      {/* eslint-disable-next-line */}
      <video
        src={source.file}
        ref={videoRef}
        style={{ cursor: isShowCursor ? 'auto' : 'none' }}
        onClick={playPause}
        onTimeUpdate={update}
        onPause={() => setIsVideoLoading(false)}
        onWaiting={() => setIsVideoLoading(true)}
        onPlaying={() => setIsVideoLoading(false)}
        onWheel={({ deltaY }) => changeVolume(deltaY < 0 ? 1 : -1)}
        onAuxClick={({ button, clientX, clientY }) => {
          if (button === 2)
            setContext({ isShow: true, x: clientX, y: clientY });
          else document.exitFullscreen();
        }}
        onEnded={() => {
          electron.store.set(`${episodeKey}.currentTime`, 0);
          dispatch(
            setEpisodeIdx(Math.min(entry.episodes.length - 1, episodeIdx + 1)),
          );
        }}
        onMouseMove={() => {
          setIsShowCursor(true);
          clearTimeout(cursorTimer);
          cursorTimer = setTimeout(() => setIsShowCursor(false), 2000);
        }}
      />
      <span className={styles.title}>
        <span>
          {[server.list[server.idx].name, `${source.qual}p`, track?.label]
            .filter((_) => _)
            .join(' • ')}
        </span>
        {episode.title}
      </span>
      {isVideoLoading && <Loading centerY />}
      <span className={styles.volume} style={{ opacity: +isShowVolume }}>
        {entry.settings.volume * 5}%
      </span>

      {textTracks && trackIdx > -1 && (
        <span
          className={styles.subtitles}
          // eslint-disable-next-line
          dangerouslySetInnerHTML={{
            __html: textTracks
              .filter((t) => currentTime >= t.start && currentTime <= t.end)
              .map((t) => t.text)
              .join('\n'),
          }}
        />
      )}

      {videoRef.current && <ProgressBar videoRef={videoRef} />}
      {context.isShow && <Context x={context.x} y={context.y} />}
    </div>
  );
}
