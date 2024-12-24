import { useEffect, useReducer, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Entry, PlayerSettings, Server, Video } from '@types';
import arrowBack from '@assets/arrowback.png';
import { useAppSelector } from '../../redux/store';
import styles from './Context.module.css';
import {
  setServerIdx,
  setSourceIdx,
  setTrackIdx,
  toggleAutoSkip,
  setMediaIdx,
  setEntryProp,
} from '../../redux';

const { electron } = window;
const minmax = (a: number, b: number, c: number) => Math.max(a, Math.min(b, c));

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

  if (video.tracks)
    return video.tracks.map((track, i) => (
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
    ));
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
            key={Math.random()}
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

function SubtitlesFont() {
  const app = useAppSelector((state) => state.app);
  const entry = app.entry as Entry;
  const { subtitlesFont } = entry.settings as PlayerSettings;
  const dispatch = useDispatch();

  return (
    <div>
      <div className={styles.setting}>
        <span>Size</span>
        <div>
          <input
            type="number"
            defaultValue={subtitlesFont.size}
            onBlur={(e) => {
              const t = e.target as HTMLInputElement;
              t.value = `${minmax(10, +t.value, 400)}`;
              const p = { k: 'settings.subtitlesFont.size', v: +t.value };
              dispatch(setEntryProp(p));
            }}
            onWheel={(e) => {
              let v = e.deltaY > 0 ? -1 : 1;
              v = minmax(10, subtitlesFont.size + v * 5, 400);
              (e.target as HTMLInputElement).value = `${v}`;
              const p = { k: 'settings.subtitlesFont.size', v };
              dispatch(setEntryProp(p));
            }}
          />
          <i>%</i>
        </div>
      </div>
      <div className={styles.setting}>
        <span>Opacity</span>
        <div>
          <input
            type="number"
            defaultValue={subtitlesFont.opacity}
            onBlur={(e) => {
              const t = e.target as HTMLInputElement;
              t.value = `${minmax(0, +t.value, 100)}`;
              const p = { k: 'settings.subtitlesFont.opacity', v: +t.value };
              dispatch(setEntryProp(p));
            }}
            onWheel={(e) => {
              let v = e.deltaY > 0 ? -1 : 1;
              v = minmax(0, subtitlesFont.opacity + v * 5, 100);
              (e.target as HTMLInputElement).value = `${v}`;
              const p = { k: 'settings.subtitlesFont.opacity', v };
              dispatch(setEntryProp(p));
            }}
          />
          <i>%</i>
        </div>
      </div>
      <div className={styles.setting}>
        <span>Shadow thickness</span>
        <div>
          <input
            type="number"
            defaultValue={subtitlesFont.shadowStrokeSize}
            onBlur={(e) => {
              const t = e.target as HTMLInputElement;
              t.value = `${minmax(0, +t.value, 20)}`;
              const p = {
                k: 'settings.subtitlesFont.shadowStrokeSize',
                v: +t.value,
              };
              dispatch(setEntryProp(p));
            }}
            onWheel={(e) => {
              let v = e.deltaY > 0 ? -1 : 1;
              v = minmax(0, subtitlesFont.shadowStrokeSize + v, 20);
              (e.target as HTMLInputElement).value = `${v}`;
              const p = { k: 'settings.subtitlesFont.shadowStrokeSize', v };
              dispatch(setEntryProp(p));
            }}
          />
          <i>px</i>
        </div>
      </div>
      <div className={styles.setting}>
        <span>Y position offset</span>
        <div>
          <input
            type="number"
            defaultValue={subtitlesFont.yAxisOffset}
            onBlur={(e) => {
              const t = e.target as HTMLInputElement;
              t.value = `${minmax(0, +t.value, 40)}`;
              const p = {
                k: 'settings.subtitlesFont.yAxisOffset',
                v: +t.value,
              };
              dispatch(setEntryProp(p));
            }}
            onWheel={(e) => {
              let v = e.deltaY > 0 ? -1 : 1;
              v = minmax(0, subtitlesFont.yAxisOffset + v, 40);
              (e.target as HTMLInputElement).value = `${v}`;
              const p = { k: 'settings.subtitlesFont.yAxisOffset', v };
              dispatch(setEntryProp(p));
            }}
          />
          <i>px</i>
        </div>
      </div>
    </div>
  );
}
export default function Context({ x, y }: { x: number; y: number }) {
  const dispatch = useDispatch();
  const [settingIdx, setSettingIdx] = useState(-1);
  const settings = [
    <Servers />,
    <Qualities />,
    <Subtitles />,
    <SubtitlesFont />,
  ];
  const app = useAppSelector((state) => state.app);
  const entry = app.entry as Entry;
  const video = app.video as Video;
  const server = app.server as { list: Server[]; idx: number };
  const entrySettings = entry.settings as PlayerSettings;
  const { sourceIdx, trackIdx } = app;
  const translateX = x + 420 > window.innerWidth ? '-100%' : '0';
  const translateY = y + 420 > window.innerHeight ? '-100%' : '0';
  const transformOriginX = translateX === '0' ? 'left' : 'right';
  const transformOriginY = translateY === '0' ? 'top' : 'bottom';
  const transformOrigin = `${transformOriginX} ${transformOriginY}`;
  const [, rerender] = useReducer((n) => n + 1, 0);
  const defaultSettingsRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const style = {
    left: `${x}px`,
    top: `${y}px`,
    translate: `${translateX} ${translateY}`,
    transformOrigin,
  };

  useEffect(() => rerender(), [x, y]);
  useEffect(() => {
    (async () => {
      if (defaultSettingsRef.current) {
        const playerSettings = JSON.stringify(
          await electron.store.get('playerSettings'),
        );
        defaultSettingsRef.current.disabled =
          JSON.stringify(entrySettings) === playerSettings;
      }
    })();
  }, [entrySettings]);

  if (settingIdx > -1)
    return (
      <div className={styles.container} style={style}>
        <button type="button" onClick={() => setSettingIdx(-1)}>
          <img src={arrowBack} alt="icon" />
        </button>
        {settings[settingIdx]}
      </div>
    );

  function disableContainerScroll() {
    if (containerRef.current) containerRef.current.style.overflowY = 'hidden';
  }
  function enableContainerScroll() {
    if (containerRef.current) containerRef.current.style.overflowY = 'scroll';
  }

  return (
    <div className={styles.container} ref={containerRef} style={style}>
      <div>
        <div
          style={{
            padding: '0 .4em',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <button
            type="button"
            style={{ margin: 0, width: 'auto' }}
            disabled={app.mediaIdx === 0}
            onClick={() => dispatch(setMediaIdx(app.mediaIdx - 1))}
          >
            [P]rev
          </button>
          <button
            style={{ margin: 0, width: 'auto' }}
            type="button"
            onClick={() => document.exitFullscreen()}
          >
            [Esc]ape
          </button>
          <button
            style={{ margin: 0, width: 'auto' }}
            type="button"
            disabled={app.mediaIdx === entry.media.length - 1}
            onClick={() => dispatch(setMediaIdx(app.mediaIdx + 1))}
          >
            [N]ext
          </button>
        </div>
        <button
          ref={defaultSettingsRef}
          type="button"
          title="Will only apply to newly added entries. Will not affect existing entries in the libary"
          onClick={(e) => {
            (e.target as HTMLButtonElement).disabled = true;
            electron.store.set('playerSettings', entry.settings);
          }}
        >
          Use this settings as default
        </button>
        <button type="button" onClick={() => dispatch(toggleAutoSkip('intro'))}>
          <span
            style={{
              opacity: entrySettings.isAutoSkip.intro ? 1 : 0,
              transform: `scale(${entrySettings.isAutoSkip.intro ? 1 : 3})`,
            }}
          />
          Auto skip intro
        </button>
        <button type="button" onClick={() => dispatch(toggleAutoSkip('outro'))}>
          <span
            style={{
              opacity: entrySettings.isAutoSkip.outro ? 1 : 0,
              transform: `scale(${entrySettings.isAutoSkip.outro ? 1 : 3})`,
            }}
          />
          Auto skip outro
        </button>
        <button
          type="button"
          onClick={() =>
            dispatch(
              setEntryProp({
                k: 'settings.isShowSubtitles',
                v: !entrySettings.isShowSubtitles,
              }),
            )
          }
        >
          <span
            style={{
              opacity: entrySettings.isShowSubtitles ? 1 : 0,
              transform: `scale(${entrySettings.isShowSubtitles ? 1 : 3})`,
            }}
          />
          Show subtitles
        </button>
      </div>
      <button type="button" onClick={() => setSettingIdx(0)}>
        <span className={styles.arrow} />
        {server.list[server.idx].name}
      </button>
      <button type="button" onClick={() => setSettingIdx(1)}>
        <span className={styles.arrow} />
        {video.sources[sourceIdx].qual}p
      </button>
      {video.tracks && video.tracks.length && (
        <button type="button" onClick={() => setSettingIdx(2)}>
          <span className={styles.arrow} />
          {video.tracks[trackIdx].label}
        </button>
      )}
      {video.tracks && (
        <button type="button" onClick={() => setSettingIdx(3)}>
          <span className={styles.arrow} />
          Subtitles font
        </button>
      )}
      <div className={styles.setting}>
        <span>Mark as seen at</span>
        <div>
          <input
            type="number"
            defaultValue={entrySettings.markAsSeenPercent}
            onBlur={(e) => {
              const t = e.target as HTMLInputElement;
              t.value = `${minmax(1, +t.value, 100)}`;
              const p = { k: 'settings.markAsSeenPercent', v: +t.value };
              dispatch(setEntryProp(p));
            }}
            onWheel={(e) => {
              let v = e.deltaY > 0 ? -1 : 1;
              v = minmax(0, entrySettings.markAsSeenPercent + v * 5, 100);
              (e.target as HTMLInputElement).value = `${v}`;
              const p = { k: 'settings.markAsSeenPercent', v };
              dispatch(setEntryProp(p));
            }}
            onMouseEnter={disableContainerScroll}
            onMouseLeave={enableContainerScroll}
          />
          <i>%</i>
        </div>
      </div>
      <div className={styles.setting}>
        <span>Playback rate</span>
        <div>
          <input
            type="number"
            defaultValue={entrySettings.playbackRate.toFixed(2)}
            onBlur={(e) => {
              const t = e.target as HTMLInputElement;
              t.value = `${minmax(0.25, +t.value, 4).toFixed(2)}`;
              const p = { k: 'settings.playbackRate', v: +t.value };
              dispatch(setEntryProp(p));
            }}
            onWheel={(e) => {
              let v = e.deltaY > 0 ? -1 : 1;
              v = minmax(0.25, entrySettings.playbackRate + v * 0.25, 4);
              (e.target as HTMLInputElement).value = `${v.toFixed(2)}`;
              const p = { k: 'settings.playbackRate', v };
              dispatch(setEntryProp(p));
            }}
            onMouseEnter={disableContainerScroll}
            onMouseLeave={enableContainerScroll}
          />
          <i>x</i>
        </div>
      </div>
    </div>
  );
}
