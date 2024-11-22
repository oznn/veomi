import { useEffect, useReducer, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Entry, ReaderSettings, ReadingMode } from '@types';
import arrowBack from '@assets/arrowback.png';
import { useAppSelector } from '../../redux/store';
import styles from './styles.module.css';
import { setEntryProp, setMediaIdx, setReadingMode } from '../../redux';

const minmax = (a: number, b: number, c: number) => Math.max(a, Math.min(b, c));
const modesMap: Record<string, string> = {
  ltr: 'Left to right',
  rtl: 'Right to left',
  ttb: 'Top to bottom',
  btt: 'Bottom to top',
  scroll: 'Long strip',
};
function Modes() {
  const dispatch = useDispatch();
  const { entry } = useAppSelector((state) => state.app);
  const { mode } = (entry as Entry).settings as ReaderSettings;

  return (
    <>
      {['ltr', 'rtl', 'ttb', 'btt', 'scroll'].map((m) => (
        <button
          type="button"
          key={m}
          onClick={() => dispatch(setReadingMode(m as ReadingMode))}
          disabled={mode === m}
        >
          <span
            style={{
              opacity: mode === m ? 1 : 0,
              transform: `scale(${mode === m ? 1 : 3})`,
              borderRadius: '50%',
            }}
          />
          {modesMap[m]}
        </button>
      ))}
    </>
  );
}

const { electron } = window;

export default function Context({ x, y }: { x: number; y: number }) {
  const [settingIdx, setSettingIdx] = useState(-1);
  const settings = [<Modes />];
  const app = useAppSelector((state) => state.app);
  const entry = app.entry as Entry;
  const entrySettings = entry.settings as ReaderSettings;
  const { mode, sliderZoom, yScrollFactor, gapSize, longStripZoom } =
    entry.settings as ReaderSettings;
  const translateX = x + 420 > window.innerWidth ? '-100%' : '0';
  const translateY = y + 420 > window.innerHeight ? '-100%' : '0';
  const transformOriginX = translateX === '0' ? 'left' : 'right';
  const transformOriginY = translateY === '0' ? 'top' : 'bottom';
  const transformOrigin = `${transformOriginX} ${transformOriginY}`;
  const [, rerender] = useReducer((n) => n + 1, 0);
  const defaultSettingsRef = useRef<HTMLButtonElement>(null);
  const dispatch = useDispatch();
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
          await electron.store.get('readerSettings'),
        );
        defaultSettingsRef.current.disabled =
          JSON.stringify(entrySettings) === playerSettings;
      }
    })();
  }, [entrySettings]);

  if (settingIdx > -1)
    return (
      <div className={styles.context} style={style}>
        <button type="button" onClick={() => setSettingIdx(-1)}>
          <img src={arrowBack} alt="icon" />
        </button>
        {settings[settingIdx]}
      </div>
    );

  return (
    <div className={styles.context} style={style}>
      <div
        style={{
          display: 'flex',
          padding: '0 .4em',
          justifyContent: 'space-between',
        }}
      >
        <button
          type="button"
          disabled={app.mediaIdx === 0}
          style={{ width: 'auto', margin: 0 }}
          onClick={() => dispatch(setMediaIdx(app.mediaIdx - 1))}
        >
          [P]rev
        </button>
        <button
          style={{ width: 'auto', margin: 0 }}
          type="button"
          onClick={() => document.exitFullscreen()}
        >
          [Esc]ape
        </button>
        <button
          type="button"
          style={{ width: 'auto', margin: 0 }}
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
          electron.store.set('readerSettings', entry.settings);
        }}
      >
        Use this settings as default
      </button>
      <button type="button" onClick={() => setSettingIdx(0)}>
        <span className={styles.arrow} />
        {modesMap[mode]}
      </button>
      <div className={styles.setting}>
        <span>Slider zoom</span>
        <div>
          <input
            type="number"
            defaultValue={100 + sliderZoom * 10}
            onBlur={(e) => {
              const t = e.target as HTMLInputElement;
              const v = (minmax(100, +t.value, 200) - 100) * 0.1;
              t.value = `${minmax(100, +t.value, 200)}`;
              const p = { k: 'settings.sliderZoom', v };
              dispatch(setEntryProp(p));
            }}
            onWheel={(e) => {
              let v = e.deltaY > 0 ? -1 : 1;
              v = Math.max(0, Math.min(sliderZoom + v, 10));
              (e.target as HTMLInputElement).value = `${100 + v * 10}`;
              const p = { k: 'settings.sliderZoom', v };
              dispatch(setEntryProp(p));
            }}
          />
          <i>%</i>
        </div>
      </div>
      <div className={styles.setting}>
        <span>Y axix scroll factor</span>
        <div>
          <input
            type="number"
            defaultValue={yScrollFactor}
            onBlur={(e) => {
              const t = e.target as HTMLInputElement;
              t.value = `${minmax(1, +t.value, 10)}`;
              const p = { k: 'settings.yScrollFactor', v: +t.value };
              dispatch(setEntryProp(p));
            }}
            onWheel={(e) => {
              let v = e.deltaY > 0 ? -1 : 1;
              v = Math.max(1, Math.min(yScrollFactor + v, 10));
              (e.target as HTMLInputElement).value = `${v}`;
              const p = { k: 'settings.yScrollFactor', v };
              dispatch(setEntryProp(p));
            }}
          />
          <i>x</i>
        </div>
      </div>
      <div className={styles.setting}>
        <span>Vertical gap size</span>
        <div>
          <input
            type="number"
            defaultValue={gapSize}
            onBlur={(e) => {
              const t = e.target as HTMLInputElement;
              t.value = `${minmax(0, +t.value, 100)}`;
              const p = { k: 'settings.gapSize', v: +t.value };
              dispatch(setEntryProp(p));
            }}
            onWheel={(e) => {
              let v = e.deltaY > 0 ? -1 : 1;
              v = Math.max(0, Math.min(gapSize + v, 100));
              (e.target as HTMLInputElement).value = `${v}`;
              const p = { k: 'settings.gapSize', v };
              dispatch(setEntryProp(p));
            }}
          />
          <i>px</i>
        </div>
      </div>
      <div className={styles.setting}>
        <span>Long strip zoom</span>
        <div>
          <input
            type="number"
            defaultValue={longStripZoom}
            onBlur={(e) => {
              const t = e.target as HTMLInputElement;
              t.value = `${minmax(-99, +t.value, 100)}`;
              const p = { k: 'settings.longStripZoom', v: +t.value };
              dispatch(setEntryProp(p));
            }}
            onWheel={(e) => {
              let v = e.deltaY > 0 ? -1 : 1;
              v = Math.max(-99, Math.min(longStripZoom + v, 100));
              (e.target as HTMLInputElement).value = `${v}`;
              const p = { k: 'settings.longStripZoom', v };
              dispatch(setEntryProp(p));
            }}
          />
          <i>px</i>
        </div>
      </div>
    </div>
  );
}
