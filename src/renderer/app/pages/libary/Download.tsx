import { useEffect, useRef } from 'react';
import buttonStyles from '@styles/Button.module.css';
import { useDispatch } from 'react-redux';
import { Entry, Queue } from '@types';
import styles from './styles.module.css';
import { useAppSelector } from '../../redux/store';
import { setQueue } from '../../redux';

const { electron } = window;
type Props = {
  close: () => void;
  entries: Entry[];
};

export default function Download({ close, entries }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const app = useAppSelector((state) => state.app);
  const { queue } = app;
  const dispatch = useDispatch();

  function download() {
    if (input.current) {
      const n = Math.max(1, parseInt(input.current.value, 10));
      const items: Queue = [];

      entries.forEach((entry) => {
        const unseen = entry.media
          .map((_, i) => i)
          .filter((m) => !entry.media[m].isSeen && !entry.media[m].downloaded)
          .slice(0, n);
        items.push(
          ...unseen
            .map((mediaIdx) => ({
              entryKey: entry.key,
              mediaIdx,
              entryTitle: entry.result.title,
              mediaKey: `entries.${entry.key}.media.${mediaIdx}`,
              mediaTitle: entry.media[mediaIdx].title,
              mediaType: entry.result.type,
              progress: 0,
              isFailed: false,
            }))
            .filter(
              (e) => queue.findIndex((q) => q.mediaKey === e.mediaKey) === -1,
            ),
        );
      });
      console.log(
        'items',
        items.map((e) => e.mediaTitle),
      );
      dispatch(setQueue((app.queue as Queue).concat(items)));
      if (!queue.length) electron.download.start();
      close();
    }
  }

  useEffect(() => {
    document.body.style.overflowY = 'hidden';
    return () => {
      document.body.style.overflowY = 'scroll';
    };
  });

  return (
    <div className={styles.download}>
      <span onClick={close} />
      <div>
        Download first{' '}
        <input
          defaultValue={1}
          type="number"
          ref={input}
          style={{
            width: '4ch',
            textAlign: 'center',
            border: 'solid 3px grey',
            borderRadius: '20px',
            padding: '0 5px',
          }}
          onWheel={(e) => {
            let v = e.deltaY > 0 ? -1 : 1;
            const n = parseInt((e.target as HTMLInputElement).value, 10);
            v = Math.max(1, n + v);
            (e.target as HTMLInputElement).value = `${v}`;
          }}
        />{' '}
        unseen and undownloaded?
        <div style={{ textAlign: 'right' }}>
          <button
            style={{ margin: '.5em 0 0 0' }}
            type="button"
            onClick={download}
            className={buttonStyles.container}
          >
            CONFIRM
          </button>
        </div>
      </div>
    </div>
  );
}
