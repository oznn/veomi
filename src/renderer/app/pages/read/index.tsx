import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Entry, ReaderSettings } from '@types';
import Reader from './Reader';
import { useAppSelector } from '../../redux/store';
import Context from './Context';
import { setReadingMode } from '../../redux';

export default function Read() {
  const [pages, setPages] = useState<string[] | null>(null);
  const app = useAppSelector((state) => state.app);
  const entry = app.entry as Entry;
  const { mode } = entry.settings as ReaderSettings;
  const { mediaIdx } = app;
  const containerRef = useRef<HTMLDivElement>(null);
  const nav = useNavigate();
  const [context, setContext] = useState({ isShow: false, x: 0, y: 0 });

  useEffect(() => {
    document.onfullscreenchange = () => !document.fullscreenElement && nav(-1);
    if (containerRef.current && !document.fullscreenElement) {
      containerRef.current.requestFullscreen();
    }
    (async () => {
      setReadingMode((entry.settings as ReaderSettings).mode);
    })();
  }, []);

  useEffect(() => {
    setPages(null);
    (async () => {
      const chapter = entry.media[mediaIdx];
      if (chapter.downloaded) return setPages(chapter.downloaded as string[]);

      const { getPages } = await import(
        `../../../ext/extensions/${entry.result.ext}`
      );

      setPages(await getPages(chapter.id));
    })();
  }, [mediaIdx]);

  return (
    // eslint-disable-next-line
    <div
      ref={containerRef}
      onAuxClick={({ clientX, clientY }) =>
        setContext({ isShow: true, x: clientX, y: clientY })
      }
    >
      {pages && <Reader pages={pages} mode={mode} />}
      {context.isShow && (
        <>
          {/* eslint-disable-next-line */}
          <span
            style={{ position: 'fixed', inset: 0 }}
            onClick={() =>
              setContext({ isShow: false, x: context.x, y: context.y })
            }
          />
          <Context x={context.x} y={context.y} />
        </>
      )}
    </div>
  );
}
