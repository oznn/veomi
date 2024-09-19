import Message from '@components/message';
import { Queue } from '@types';
import { useAppSelector } from '../../redux/store';

export default function Downloads() {
  const app = useAppSelector((state) => state.app);
  const { queue } = app;

  if (!queue.length) return <Message msg="Queue is empty" />;

  const groupedQueue = queue.reduce((a: any, b: any) => {
    (a[b.entryTitle] = a[b.entryTitle] || []).push(b);
    return a;
  }, {});

  return (
    <div>
      {Object.keys(groupedQueue).map((k) => (
        <>
          <h2 key={k}>{k}</h2>
          {(groupedQueue[k] as Queue).map((e) => (
            <span key={e.episodeTitle}>
              {e.progress.toFixed(2)}% {e.episodeTitle}
            </span>
          ))}
        </>
      ))}
    </div>
  );
}
