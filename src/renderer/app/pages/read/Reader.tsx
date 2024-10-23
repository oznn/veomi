import { useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { Chapter, Entry, ReaderSettings, ReadingMode } from '@types';
import styles from './styles.module.css';
import { useAppSelector } from '../../redux/store';
import { setCurrentPage, setEntryProp, setMediaIdx } from '../../redux';

const minmax = (x: number, y: number, z: number) => Math.max(x, Math.min(y, z));

type Props = {
  pages: string[];
  mode: ReadingMode;
};

const { electron } = window;
export default function Reader({ pages, mode }: Props) {
  const app = useAppSelector((state) => state.app);
  const entry = app.entry as Entry;
  const { zoom, yScrollFactor } = entry.settings as ReaderSettings;
  const { mediaIdx } = app;
  const { currentPage } = entry.media[mediaIdx] as Chapter;
  const dispatch = useDispatch();
  const [scrollY, setScrollY] = useState(0);
  const translate = (n: number) => {
    if (mode === 'btt') return `translate(0, ${n}%)`;
    if (mode === 'ltr') return `translate(${-n}%, 0)`;
    if (mode === 'ttb') return `translate(0, ${-n}%)`;
    if (mode === 'rtl') return `translate(${n}%, 0)`;
  };

  function move(n: number) {
    const pageIdx = currentPage + n;
    const dy = minmax(0, scrollY + n * yScrollFactor, zoom);

    if (currentPage !== 0 && scrollY !== dy) return setScrollY(dy);
    if (pageIdx === -1 && mediaIdx > 0)
      return dispatch(setMediaIdx(mediaIdx - 1));
    if (pageIdx === pages.length + 1 && mediaIdx < entry.media.length - 1)
      return dispatch(setMediaIdx(mediaIdx + 1));
    if (pageIdx === pages.length) {
      const key = `entries.${entry.key}.media.${mediaIdx}.isSeen`;
      electron.store.set(key, true);
    }
    if (n > 0) setScrollY(0);
    else setScrollY(zoom);

    return dispatch(
      setCurrentPage(
        minmax(
          0,
          currentPage + n,
          pages.length + +(mediaIdx === entry.media.length - 1),
        ),
      ),
    );
  }

  function adjustZoom(n: number) {
    if (n < 0) setScrollY((v) => Math.max(0, v - 1));
    dispatch(setEntryProp({ k: 'settings.zoom', v: Math.max(0, zoom + n) }));
  }
  useEffect(() => {
    window.onkeydown = ({ key }) => {
      switch (key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
        case 'h':
        case 'H':
          if (mode === 'rtl') move(1);
          if (mode === 'ltr') move(-1);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
        case 'l':
        case 'L':
          if (mode === 'rtl') move(-1);
          if (mode === 'ltr') move(1);
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
        case 'k':
        case 'K':
          if (mode === 'btt') move(1);
          if (mode === 'ttb') move(-1);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
        case 'j':
        case 'J':
          if (mode === 'btt') move(-1);
          if (mode === 'ttb') move(1);
          break;
        case 'i':
        case 'I':
        case 'e':
        case 'E':
          adjustZoom(1);
          break;
        case 'o':
        case 'O':
        case 'q':
        case 'Q':
          adjustZoom(-1);
          break;
        case 'n':
        case 'N':
          dispatch(setMediaIdx(Math.min(entry.media.length - 1, mediaIdx + 1)));
          break;
        case 'p':
        case 'P':
          dispatch(setMediaIdx(Math.max(0, mediaIdx - 1)));
          break;
        default:
        // no default
      }
    };
    return () => {
      window.onkeydown = () => {};
    };
  });

  return (
    <div
      className={styles.reader}
      style={{ overflow: mode === 'scroll' ? 'scroll' : 'hidden' }}
    >
      <div
        className={styles.slider}
        style={{
          transform: translate(currentPage * 100),
        }}
        onWheel={({ deltaY }) => adjustZoom(deltaY > 0 ? 1 : -1)}
      >
        {mode !== 'scroll' && (
          <>
            <button
              type="button"
              onClick={({ clientX, clientY }) => {
                if (mode === 'ltr' || mode === 'rtl')
                  move(clientX > window.innerWidth / 2 ? -1 : 1);
                if (mode === 'ttb' || mode === 'btt')
                  move(clientY > window.innerHeight / 2 ? 1 : -1);
              }}
            >
              {entry.media[mediaIdx].title}
            </button>
            {pages.map((src, i) => (
              <button
                type="button"
                key={src}
                style={{ transform: translate(100 * (-i - 1)) }}
                onClick={({ clientX, clientY }) => {
                  if (mode === 'ltr' || mode === 'rtl')
                    move(clientX > window.innerWidth / 2 ? -1 : 1);
                  if (mode === 'ttb' || mode === 'btt')
                    move(clientY > window.innerHeight / 2 ? 1 : -1);
                }}
              >
                <img
                  src={src}
                  alt="page"
                  style={{
                    scale: `${1 + zoom * 0.1}`,
                    translate: `0 -${scrollY * 10}%`,
                  }}
                />
              </button>
            ))}
            <button
              type="button"
              style={{ transform: translate(-100 * (pages.length + 1)) }}
              onClick={({ clientX, clientY }) => {
                if (mode === 'ltr' || mode === 'rtl')
                  move(clientX > window.innerWidth / 2 ? -1 : 1);
                if (mode === 'ttb' || mode === 'btt')
                  move(clientY > window.innerHeight / 2 ? 1 : -1);
              }}
            >
              No more chapters
            </button>
          </>
        )}
        {mode === 'scroll' && (
          <>
            <div
              style={{
                width: '100vw',
                height: '100vh',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              {entry.media[mediaIdx].title}
            </div>
            {pages.map((src) => (
              <div key={src}>
                <img
                  style={{
                    display: 'block',
                    margin: '.5em auto',
                  }}
                  key={src}
                  src={src}
                  alt="page"
                />
              </div>
            ))}
            <div>end</div>
          </>
        )}
      </div>
      <span className={styles.number}>{`${Math.min(
        pages.length,
        currentPage,
      )} / ${pages.length}`}</span>
    </div>
  );
}
