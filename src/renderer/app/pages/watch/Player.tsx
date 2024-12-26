import Hls from 'hls.js';
import { WebVTTParser } from 'webvtt-parser';
import Loading from '@components/loading';
import { useDispatch } from 'react-redux';
import { Video, Entry, Server, PlayerSettings, Episode } from '@types';
import { useEffect, useRef, useState } from 'react';
import ProgressBar from './ProgressBar';
import { useAppSelector } from '../../redux/store';
import {
  setEpisodeCurrentTime,
  setVolume,
  setMediaIdx,
  serverRetry,
  setPlaybackRate,
  setEntryProp,
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
  const { mediaIdx, sourceIdx, trackIdx } = app;
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const source = video.sources[sourceIdx];
  const track = video.tracks ? video.tracks[trackIdx] : null;
  const episode = entry.media[mediaIdx] as Episode;
  const episodeKey = `entries.${entry.key}.media.${mediaIdx}`;
  const settings = entry.settings as PlayerSettings;
  const [isShowCursor, setIsShowCursor] = useState(false);
  const [isShowVolume, setIsShowVolume] = useState(false);
  const [context, setContext] = useState({ isShow: false, x: 0, y: 0 });
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [textTracks, setTextTracks] = useState<TextTrack[] | null>(null);
  const hls = new Hls({ debug: false });

  function changeVolume(v: number) {
    if (videoRef.current) {
      const volume = Math.max(0, Math.min(settings.volume + v, 20));
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
  document.onkeydown = ({ key, ctrlKey }) => {
    if (videoRef.current)
      switch (key) {
        case 'ArrowRight':
        case 'l':
        case 'L':
        case 'd':
        case 'D':
          videoRef.current.currentTime = Math.min(
            videoRef.current.duration,
            videoRef.current.currentTime + (ctrlKey ? 1 / 24 : 5),
          );
          break;
        case 'ArrowLeft':
        case 'h':
        case 'H':
        case 'a':
        case 'A':
          videoRef.current.currentTime = Math.max(
            0,
            videoRef.current.currentTime - (ctrlKey ? 1 / 24 : 5),
          );
          break;
        case 'ArrowUp':
        case 'k':
        case 'K':
        case 'w':
        case 'W':
          changeVolume(1);
          break;
        case 'ArrowDown':
        case 'j':
        case 'J':
        case 's':
        case 'S':
          changeVolume(-1);
          break;
        case ' ':
          playPause();
          break;
        case 'n':
        case 'N':
          dispatch(setMediaIdx(Math.min(entry.media.length - 1, mediaIdx + 1)));
          break;
        case 'p':
        case 'P':
          dispatch(setMediaIdx(Math.max(0, mediaIdx - 1)));
          break;
        case ',':
        case '<':
          dispatch(
            setPlaybackRate(Math.max(0.25, settings.playbackRate - 0.25)),
          );
          break;
        case '.':
        case '>':
          dispatch(setPlaybackRate(Math.min(settings.playbackRate + 0.25, 4)));
          break;
        case 'c':
        case 'C':
          dispatch(
            setEntryProp({
              k: 'settings.isShowSubtitles',
              v: !settings.isShowSubtitles,
            }),
          );
          break;
        case 't':
        case 'T':
          videoRef.current.currentTime = Math.min(
            videoRef.current.duration,
            videoRef.current.currentTime + settings.timeJump,
          );
          break;
        default:
        // no default
      }
  };

  useEffect(() => {
    window.ononline = () => dispatch(serverRetry());
    if (videoRef.current) {
      if (source.file.includes('.m3u8') || source.file.includes('.ts')) {
        hls.loadSource(source.file);
        hls.attachMedia(videoRef.current);
        hls.on(Hls.Events.ERROR, (_, data) => console.log('hlsErr', data.type));
      }

      videoRef.current.currentTime = episode.currentTime;
      videoRef.current.volume = settings.volume * 0.05;
      videoRef.current.playbackRate = settings.playbackRate;
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
    if (videoRef.current) videoRef.current.playbackRate = settings.playbackRate;
  }, [settings.playbackRate]);

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
      if (settings.isAutoSkip.intro) skip('intro', currentTime);
      if (settings.isAutoSkip.outro) skip('outro', currentTime);
      if (!episode.isSeen && progressPercent >= settings.markAsSeenPercent)
        electron.store.set(`${episodeKey}.isSeen`, true);
      dispatch(
        setEpisodeCurrentTime({
          mediaIdx,
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
          dispatch(setMediaIdx(Math.min(entry.media.length - 1, mediaIdx + 1)));
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
        {settings.volume * 5}%
      </span>

      {settings.isShowSubtitles && textTracks && (
        <pre
          className={styles.subtitles}
          style={{
            fontSize: `${(settings.subtitlesFont.size * 0.01).toFixed(1)}em`,
            opacity: settings.subtitlesFont.opacity * 0.01,
            bottom: `${5 + settings.subtitlesFont.yAxisOffset}%`,
            textShadow: `0 0 ${settings.subtitlesFont.shadowStrokeSize}px #000,`
              .repeat(4)
              .slice(0, -1),
            display: 'inline-block',
            pointerEvents: 'none',
          }}
          // eslint-disable-next-line
          dangerouslySetInnerHTML={{
            __html: textTracks
              .filter((t) => currentTime >= t.start && currentTime <= t.end)
              .map((t) => t.text)
              .reverse()
              .join('\n\n'),
          }}
        />
      )}

      {videoRef.current && <ProgressBar videoRef={videoRef} />}
      {context.isShow && <Context x={context.x} y={context.y} />}
    </div>
  );
}
