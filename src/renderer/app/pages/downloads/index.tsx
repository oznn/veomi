import Message from '@components/message';
import buttonStyles from '@styles/Button.module.css';
import { Queue } from '@types';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../redux/store';
import { setQueue } from '../../redux';
import styles from './styles.module.css';

const { electron } = window;

export default function Downloads() {
  const app = useAppSelector((state) => state.app);
  const { queue } = app;
  const dispatch = useDispatch();

  if (!queue.length) return <Message msg="Queue is empty" />;
  const groupedQueue = queue.reduce((a: any, b: any) => {
    (a[b.entryTitle] = a[b.entryTitle] || []).push(b);
    return a;
  }, {});

  return (
    <div className={styles.container}>
      {Object.keys(groupedQueue).map((key, i) => (
        <ul style={{ margin: '1em' }} key={key}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
              type="button"
              className={buttonStyles.container}
              style={{ fontSize: '.7em' }}
              onClick={() => {
                dispatch(
                  setQueue(
                    queue.filter(({ entryTitle }) => entryTitle !== key),
                  ),
                );
                if (!i) electron.ffmpeg.stop();
              }}
            >
              CANCEL
            </button>
            <span
              style={{
                fontSize: '1.2em',
                margin: '0',
                padding: '0',
              }}
            >
              {`${key} `}
            </span>
          </div>
          {(groupedQueue[key] as Queue).map((e, j) => (
            <ul key={e.mediaTitle}>
              <li key={e.mediaTitle} style={{ color: '#ccc' }}>
                <button
                  type="button"
                  className={buttonStyles.container}
                  style={{ fontSize: '.6em', margin: '0' }}
                  onClick={() => {
                    dispatch(setQueue(queue.filter((_, k) => j !== k)));
                    if (!i && !j) electron.ffmpeg.stop();
                  }}
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  className={buttonStyles.container}
                  style={{ fontSize: '.6em' }}
                  disabled={!e.isFailed}
                  onClick={() => {
                    dispatch(
                      setQueue(
                        queue.map((item, idx) =>
                          j === idx ? { ...item, isFailed: false } : item,
                        ),
                      ),
                    );
                    electron.download.start();
                  }}
                >
                  RETRY
                </button>
                <span style={{ color: e.isFailed ? 'grey' : 'silver' }}>
                  {e.progress ? e.progress.toFixed(2) : 0}% {e.mediaTitle}
                </span>
              </li>
            </ul>
          ))}
        </ul>
      ))}
    </div>
  );
}
