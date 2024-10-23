import { useEffect, useReducer, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Entry, ReaderSettings, ReadingMode } from '@types';
import arrowBack from '@assets/arrowback.png';
import { useAppSelector } from '../../redux/store';
import styles from './styles.module.css';
import { setEntryProp, setMediaIdx, setReadingMode } from '../../redux';

const modesMap: Record<string, string> = {
  ltr: 'Left to right',
  rtl: 'Right to left',
  ttb: 'Top to bottom',
  btt: 'Bottom to top',
  scroll: 'Free scroll',
};
function Modes() {
  const dispatch = useDispatch();
  const { entry } = useAppSelector((state) => state.app);
  const { mode } = (entry as Entry).settings as ReaderSettings;

  return (
    <>
      {['ltr', 'rtl', 'ttb', 'btt'].map((m) => (
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

function Zoom() {
  const app = useAppSelector((state) => state.app);
  const entry = app.entry as Entry;
  const { zoom } = entry.settings as ReaderSettings;
  const dispatch = useDispatch();

  return (
    <>
      <span style={{ textAlign: 'center', display: 'block' }}>
        Zoom Percent
      </span>
      <div style={{ display: 'flex' }}>
        <button
          type="button"
          style={{
            display: 'inline',
            textAlign: 'center',
          }}
          onClick={() =>
            dispatch(
              setEntryProp({ k: 'settings.zoom', v: Math.max(0, zoom - 1) }),
            )
          }
        >
          ---
        </button>
        <span>{100 + zoom * 10}%</span>
        <button
          type="button"
          style={{
            display: 'inline',
            textAlign: 'center',
          }}
          onClick={() =>
            dispatch(setEntryProp({ k: 'settings.zoom', v: zoom + 1 }))
          }
        >
          +++
        </button>
      </div>
    </>
  );
}

function YScrollFactor() {
  const app = useAppSelector((state) => state.app);
  const entry = app.entry as Entry;
  const { yScrollFactor } = entry.settings as ReaderSettings;
  const dispatch = useDispatch();

  return (
    <>
      <span style={{ textAlign: 'center', display: 'block' }}>
        Y axis scroll factor
      </span>
      <div style={{ display: 'flex' }}>
        <br />
        <button
          type="button"
          style={{
            display: 'inline',
            textAlign: 'center',
          }}
          onClick={() =>
            dispatch(
              setEntryProp({
                k: 'settings.yScrollFactor',
                v: Math.max(0, yScrollFactor - 1),
              }),
            )
          }
        >
          ---
        </button>
        <span>{yScrollFactor}x</span>
        <button
          type="button"
          style={{
            display: 'inline',
            textAlign: 'center',
          }}
          onClick={() =>
            dispatch(
              setEntryProp({
                k: 'settings.yScrollFactor',
                v: yScrollFactor + 1,
              }),
            )
          }
        >
          +++
        </button>
      </div>
    </>
  );
}

const { electron } = window;

export default function Context({ x, y }: { x: number; y: number }) {
  const [settingIdx, setSettingIdx] = useState(-1);
  const settings = [<Modes />, <Zoom />, <YScrollFactor />];
  const app = useAppSelector((state) => state.app);
  const entry = app.entry as Entry;
  const entrySettings = entry.settings as ReaderSettings;
  const { mode, zoom, yScrollFactor } = entry.settings as ReaderSettings;
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
      <div style={{ display: 'flex' }}>
        <button
          type="button"
          disabled={app.mediaIdx === 0}
          onClick={() => dispatch(setMediaIdx(app.mediaIdx - 1))}
        >
          [P]rev
        </button>
        <button type="button" onClick={() => document.exitFullscreen()}>
          [Esc]ape
        </button>
        <button
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
          electron.store.set('readerSettings', entry.settings);
        }}
      >
        Use this settings as default
      </button>
      <button type="button" onClick={() => setSettingIdx(0)}>
        <span className={styles.arrow} />
        {modesMap[mode]}
      </button>
      <button type="button" onClick={() => setSettingIdx(1)}>
        <span className={styles.arrow} />
        {100 + zoom * 10}%
      </button>
      <button type="button" onClick={() => setSettingIdx(2)}>
        <span className={styles.arrow} />
        {yScrollFactor}x
      </button>
    </div>
  );
}
