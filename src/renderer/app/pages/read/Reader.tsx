import useDidMountEffect from '@components/useDidMountEffect';
import { useDispatch } from 'react-redux';
import { useEffect, useRef, useState } from 'react';
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
let heights: number[] = [];

let isShift = false;

export default function Reader({ pages, mode }: Props) {
  const app = useAppSelector((state) => state.app);
  const entry = app.entry as Entry;
  const { longStripZoom, sliderZoom, yScrollFactor, gapSize } =
    entry.settings as ReaderSettings;
  const { mediaIdx } = app;
  const scrollRef = useRef<HTMLDivElement>(null);
  const { currentPage } = entry.media[mediaIdx] as Chapter;
  const dispatch = useDispatch();
  const [scrollY, setScrollY] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [length, setLength] = useState(1);
  const translate = (n: number) => {
    if (mode === 'btt') return `translate(0, ${n}%)`;
    if (mode === 'ltr') return `translate(${-n}%, 0)`;
    if (mode === 'ttb') return `translate(0, ${-n}%)`;
    if (mode === 'rtl') return `translate(${n}%, 0)`;
  };

  const next = () =>
    dispatch(setMediaIdx(Math.min(entry.media.length - 1, mediaIdx + 1)));
  const prev = () => dispatch(setMediaIdx(Math.max(0, mediaIdx - 1)));

  function move(n: number) {
    if (mode === 'scroll') {
      const m = heights.at(-1) || 0;
      if (scrollTop === m + 1 && n > 0) {
        const key = `entries.${entry.key}.media.${mediaIdx}`;
        electron.store.set(`${key}.isSeen`, true);
        return next();
      }
      if (scrollTop === 0 && n < 0) return prev();
      const a = minmax(
        0,
        scrollTop + n * (isShift ? 1 : yScrollFactor) * 100,
        m ? m + 1 : 0,
      );
      const i = heights.findLastIndex((h) => a > h);

      dispatch(setCurrentPage(i + 2));
      return setScrollTop(a);
    }
    const pageIdx = currentPage + n;
    const dy = minmax(0, scrollY + n * yScrollFactor, sliderZoom);

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
    else setScrollY(sliderZoom);

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
    if (mode === 'scroll') {
      const v = Math.max(-99, Math.min(longStripZoom + n, 100));
      const p = { k: 'settings.longStripZoom', v };

      return dispatch(setEntryProp(p));
    }
    if (n < 0) setScrollY((v) => Math.max(0, v - 1));
    dispatch(
      setEntryProp({
        k: 'settings.sliderZoom',
        v: Math.max(0, sliderZoom + n),
      }),
    );
  }

  useDidMountEffect(() => {
    setTimeout(() => {
      if (scrollRef.current) {
        heights = [...scrollRef.current.querySelectorAll('img')].map((img) =>
          Math.floor(img.getBoundingClientRect().bottom + scrollTop),
        );
        if (currentPage > 1) setScrollTop(heights[currentPage - 2]);
      }
    }, 100);
  }, [longStripZoom, gapSize]);
  useEffect(() => {
    // eslint-disable-next-line
    window.onkeyup = ({ key }) => key === 'Shift' && (isShift = false);
    window.onkeydown = ({ key }) => {
      switch (key) {
        case 'Shift':
          isShift = true;
          break;
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
          if (mode === 'scroll') move(-1);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
        case 'j':
        case 'J':
          if (mode === 'btt') move(-1);
          if (mode === 'ttb') move(1);
          if (mode === 'scroll') move(1);
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
          next();
          break;
        case 'p':
        case 'P':
          prev();
          break;
        default:
        // no default
      }
    };
    return () => {
      window.onkeydown = () => {};
      window.onkeyup = () => {};
    };
  });

  return (
    <div className={styles.reader}>
      {mode !== 'scroll' && (
        <div
          className={styles.slider}
          style={{
            transform: translate(currentPage * 100),
          }}
          onWheel={({ deltaY }) => adjustZoom(deltaY > 0 ? 1 : -1)}
        >
          <button
            tabIndex={-1}
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
          {pages.slice(0, length).map((src, i) => (
            <button
              tabIndex={-1}
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
                onLoad={() => i + 1 === length && setLength((l) => l + 1)}
                tabIndex={-1}
                src={src}
                alt="page"
                style={{
                  scale: `${1 + sliderZoom * 0.1}`,
                  translate: `0 -${scrollY * 10}%`,
                  maxHeight: '100%',
                  outline: 'none',
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
        </div>
      )}
      {mode === 'scroll' && (
        <div
          style={{
            width: '100vw',
            height: '100vh',
            position: 'relative',
            textAlign: 'center',
            transform: `translateY(${-scrollTop}px)`,
            transition: 'transform 200ms ease',
          }}
          ref={scrollRef}
          onWheel={({ deltaY }) => move(deltaY > 0 ? 1 : -1)}
        >
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
          {pages.slice(0, length).map((src, i) => (
            <div
              key={src}
              style={{
                display: 'inline-block',
                verticalAlign: 'text-bottom',
              }}
            >
              <img
                onLoad={(e) => {
                  const t = e.target as HTMLImageElement;
                  const { bottom } = t.getBoundingClientRect();
                  const c = Math.max(0, currentPage - 2);

                  if (i === 0) heights = [];
                  if (i + 1 === length) setLength((l) => l + 1);
                  heights.splice(i, 0, Math.floor(bottom + scrollTop));
                  if (i === pages.length - 1 && scrollRef.current)
                    if (currentPage > 1 && heights[c] + 1 > scrollTop)
                      setScrollTop(heights[c] + 1);
                }}
                src={src}
                alt="page"
                style={{
                  margin: `auto auto ${gapSize}px auto`,
                  display: 'block',
                  width: `calc(100% + ${longStripZoom * 50}px)`,
                  transition: 'all 200ms ease',
                  translate:
                    longStripZoom > 0 ? `${(-longStripZoom * 50) / 2}px` : '0',
                }}
              />
            </div>
          ))}
          <div
            style={{
              width: '100vw',
              height: '100vh',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            {entry.media[mediaIdx + 1]
              ? entry.media[mediaIdx + 1].title
              : 'No more chapters'}
          </div>
        </div>
      )}
      <span className={styles.number}>{`${mediaIdx + 1}. ${minmax(
        1,
        currentPage,
        pages.length,
      )} / ${pages.length}`}</span>
    </div>
  );
}
