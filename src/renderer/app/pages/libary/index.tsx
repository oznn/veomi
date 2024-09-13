import Message from '@components/message';
import { Entry } from '@types';
import { useEffect, useReducer } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import resultsStyles from '@styles/Results.module.css';
import { useDispatch } from 'react-redux';
import { setEntry, setEpisodeIdx } from '../../redux';

const { electron } = window;
let entries: Entry[] | null = null;
export default function Libary() {
  const nav = useNavigate();
  const [, rerender] = useReducer((n) => n + 1, 0);
  const dispatch = useDispatch();
  // const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await electron.store.get('entries');
        const allEntries = Object.values(res || {}) as Entry[];

        entries = allEntries.filter((entry) => entry.isInLibary);
        rerender();
      } catch (err) {
        console.log(`${err}`);
      }
    })();
  }, []);

  if (!entries) return '';
  if (!entries.length) return <Message msg="Libary is empty" />;

  function remove(i: number) {
    if (entries) {
      electron.store.delete(`entries.${entries[i].key}`);
      electron.poster.delete(entries[i].posterPath);
      entries.splice(i, 1);
      rerender();
    }
  }

  return (
    <ul className={resultsStyles.container}>
      {entries.map((entry, i) => (
        <Link
          key={entry.key}
          to={`/entry?result=${JSON.stringify(entry.result)}`}
          className={resultsStyles.link}
          onAuxClick={({ button }) => {
            if (button - 1) {
              const n = entry.episodes.findIndex((e) => !e.isSeen);

              dispatch(setEpisodeIdx(Math.max(0, n)));
              dispatch(setEntry(entry));
              nav('/watch');
            } else remove(i);
          }}
        >
          <div>
            <img src={entry.posterPath} alt="poster" />
          </div>
          <span title={entry.result.title}>{entry.result.title}</span>
          <span className={resultsStyles.remaining}>
            {entry.episodes.filter((e) => !e.isSeen).length}
          </span>
        </Link>
      ))}
    </ul>
  );
}
