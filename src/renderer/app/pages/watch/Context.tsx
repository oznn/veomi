import { useEffect, useReducer, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Entry, Server, Video } from '@types';
import arrowBack from '@assets/arrowback.png';
import { useAppSelector } from '../../redux/store';
import styles from './Context.module.css';
import {
  setServerIdx,
  setSourceIdx,
  setTrackIdx,
  setPlaybackRate,
  toggleAutoSkip,
  setEpisodeIdx,
  setMarkAsSeenPercent,
} from '../../redux';

function Servers() {
  const dispatch = useDispatch();
  const app = useAppSelector((state) => state.app);
  const server = app.server as { list: Server[]; idx: number };

  return (
    <>
      {server.list.map(({ name }, i) => (
        <button
          type="button"
          key={name}
          onClick={() => dispatch(setServerIdx(i))}
          disabled={server.idx === i}
        >
          <span
            style={{
              opacity: server.idx === i ? 1 : 0,
              transform: `scale(${server.idx === i ? 1 : 3})`,
              borderRadius: '50%',
            }}
          />
          {name}
        </button>
      ))}
    </>
  );
}

function Subtitles() {
  const dispatch = useDispatch();
  const app = useAppSelector((state) => state.app);
  const video = app.video as Video;
  const { trackIdx } = app;

  return (
    <>
      <button
        type="button"
        onClick={() => dispatch(setTrackIdx(-1))}
        disabled={trackIdx === -1}
      >
        <span
          style={{
            opacity: trackIdx === -1 ? 1 : 0,
            transform: `scale(${trackIdx === -1 ? 1 : 3})`,
            borderRadius: '50%',
          }}
        />
        off
      </button>
      {video.tracks &&
        video.tracks.map((track, i) => (
          <button
            key={track.file}
            type="button"
            onClick={() => dispatch(setTrackIdx(i))}
            disabled={trackIdx === i}
          >
            <span
              style={{
                opacity: trackIdx === i ? 1 : 0,
                transform: `scale(${trackIdx === i ? 1 : 3})`,
                borderRadius: '50%',
              }}
            />
            {track.label}
          </button>
        ))}
    </>
  );
}

function Qualities() {
  const dispatch = useDispatch();
  const app = useAppSelector((state) => state.app);
  const video = app.video as Video;
  const { sourceIdx } = app;

  return (
    <>
      {video.sources
        // .sort((a, b) => b.qual - a.qual)
        .map(({ qual }, i) => (
          <button
            type="button"
            key={qual}
            onClick={() => dispatch(setSourceIdx(i))}
            disabled={sourceIdx === i}
          >
            <span
              style={{
                opacity: sourceIdx === i ? 1 : 0,
                transform: `scale(${sourceIdx === i ? 1 : 3})`,
                borderRadius: '50%',
              }}
            />
            {qual}p
          </button>
        ))}
    </>
  );
}

function Playback() {
  const dispatch = useDispatch();
  const app = useAppSelector((state) => state.app);
  const entry = app.entry as Entry;
  const { playbackRate } = entry.settings;

  return (
    <div style={{ padding: '0 .5em' }}>
      <span style={{ display: 'block', textAlign: 'center' }}>
        {playbackRate.toFixed(2)}x
      </span>
      <input
        type="range"
        step={1}
        max={12}
        defaultValue={(playbackRate - 1) / 0.25}
        onChange={({ target }) => {
          const speed = +target.value * 0.25 + 1;
          dispatch(setPlaybackRate(speed));
        }}
      />
    </div>
  );
}

function MarkAsSeenPercent() {
  const app = useAppSelector((state) => state.app);
  const entry = app.entry as Entry;
  const dispatch = useDispatch();

  return (
    <div style={{ textAlign: 'center' }}>
      {'Mark as seen at '}
      <input
        style={{
          border: 'solid 3px grey',
          width: '3ch',
          padding: '0 .2em',
          borderRadius: '10px',
          color: 'grey',
        }}
        type="number"
        defaultValue={entry.settings.markAsSeenPercent}
        onChange={(e) => {
          e.target.value = `${Math.max(0, Math.min(+e.target.value, 100))}`;
          dispatch(setMarkAsSeenPercent(+e.target.value));
        }}
      />
      %
    </div>
  );
}

export default function Context({ x, y }: { x: number; y: number }) {
  const dispatch = useDispatch();
  const [settingIdx, setSettingIdx] = useState(-1);
  const settings = [
    <Servers />,
    <Qualities />,
    <Playback />,
    <MarkAsSeenPercent />,
    <Subtitles />,
  ];
  const app = useAppSelector((state) => state.app);
  const entry = app.entry as Entry;
  const video = app.video as Video;
  const server = app.server as { list: Server[]; idx: number };
  const { sourceIdx, trackIdx } = app;
  const translateX = x + 400 > window.innerWidth ? '-100%' : '0';
  const translateY = y + 400 > window.innerHeight ? '-100%' : '0';
  const transformOriginX = translateX === '0' ? 'left' : 'right';
  const transformOriginY = translateY === '0' ? 'top' : 'bottom';
  const transformOrigin = `${transformOriginX} ${transformOriginY}`;
  const [, rerender] = useReducer((n) => n + 1, 0);
  const style = {
    left: `${x}px`,
    top: `${y}px`,
    translate: `${translateX} ${translateY}`,
    transformOrigin,
  };

  useEffect(() => rerender(), [x, y]);

  if (settingIdx > -1)
    return (
      <div className={styles.container} style={style}>
        <button type="button" onClick={() => setSettingIdx(-1)}>
          <img src={arrowBack} alt="icon" />
        </button>
        {settings[settingIdx]}
      </div>
    );

  return (
    <div className={styles.container} style={style}>
      <div>
        <div style={{ display: 'flex' }}>
          <button
            type="button"
            disabled={app.episodeIdx === 0}
            onClick={() => dispatch(setEpisodeIdx(app.episodeIdx - 1))}
          >
            [P]rev
          </button>
          <button type="button" onClick={() => document.exitFullscreen()}>
            [E]xit
          </button>
          <button
            type="button"
            disabled={app.episodeIdx === entry.episodes.length - 1}
            onClick={() => dispatch(setEpisodeIdx(app.episodeIdx + 1))}
          >
            [N]ext
          </button>
        </div>
        <button type="button" onClick={() => dispatch(toggleAutoSkip('intro'))}>
          <span
            style={{
              opacity: entry.settings.isAutoSkip.intro ? 1 : 0,
              transform: `scale(${entry.settings.isAutoSkip.intro ? 1 : 3})`,
            }}
          />
          Auto skip intro
        </button>
        <button type="button" onClick={() => dispatch(toggleAutoSkip('outro'))}>
          <span
            style={{
              opacity: entry.settings.isAutoSkip.outro ? 1 : 0,
              transform: `scale(${entry.settings.isAutoSkip.outro ? 1 : 3})`,
            }}
          />
          Auto skip outro
        </button>
      </div>
      <div>
        <button type="button" onClick={() => setSettingIdx(0)}>
          <span className={styles.arrow} />
          {server.list[server.idx].name}
        </button>
      </div>
      <div>
        <button type="button" onClick={() => setSettingIdx(1)}>
          <span className={styles.arrow} />
          {video.sources[sourceIdx].qual}p
        </button>
      </div>
      <div>
        <button type="button" onClick={() => setSettingIdx(2)}>
          <span className={styles.arrow} />
          {entry.settings.playbackRate.toFixed(2)}x
        </button>
      </div>
      <div>
        <button type="button" onClick={() => setSettingIdx(3)}>
          <span className={styles.arrow} />
          {entry.settings.markAsSeenPercent}%
        </button>
      </div>
      {video.tracks && (
        <div>
          <button type="button" onClick={() => setSettingIdx(4)}>
            <span className={styles.arrow} />
            {trackIdx > -1 ? video.tracks[trackIdx].label : 'Subtitles'}
          </button>
        </div>
      )}
    </div>
  );
}
