import Message from '@components/message';
import { Entry } from '@types';
import { useEffect, useReducer, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import resultsStyles from '@styles/Results.module.css';
import { useDispatch } from 'react-redux';
import { setEntry, setEpisodeIdx } from '../../redux';
import styles from './styles.module.css';

const { electron } = window;
let entries: Entry[] | null = null;
export default function Libary() {
  const nav = useNavigate();
  const [, rerender] = useReducer((n) => n + 1, 0);
  const dispatch = useDispatch();
  const [selected, setSelected] = useState<number[]>([]);
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

  function toggleSelect(i: number) {
    if (selected.includes(i)) setSelected(selected.filter((n) => n !== i));
    else setSelected((arr) => [...arr, i]);
  }

  return (
    <>
      <ul className={resultsStyles.container}>
        {entries.map((entry, i) => (
          <Link
            style={{
              background: selected.includes(i) ? '#ffffff44' : '#ffffff11',
            }}
            key={entry.key}
            to={`/entry?result=${JSON.stringify(entry.result)}`}
            className={resultsStyles.link}
            // onAuxClick={({ button }) => {
            //   if (button - 1) {
            //     const n = entry.episodes.findIndex((e) => !e.isSeen);
            //
            //     dispatch(setEpisodeIdx(Math.max(0, n)));
            //     dispatch(setEntry(entry));
            //     nav('/watch');
            //   } else remove(i);
            // }}
            onAuxClick={() => toggleSelect(i)}
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

      {selected.length > 0 && (
        <div className={styles.options}>
          <div>
            <button type="button">pin</button>
            <button type="button">change poster</button>
            <button type="button">entry</button>
            <button type="button">catogorize</button>
            <button type="button">update</button>
            <button type="button">delete</button>
          </div>
          <div>
            <span style={{ color: 'grey' }}>{selected.length}</span>
          </div>
          <div>
            <button
              type="button"
              disabled={selected.length === entries.length}
              onClick={() =>
                setSelected(
                  [...Array((entries as Entry[]).length)].map((_, i) => i),
                )
              }
            >
              all
            </button>
            <button
              type="button"
              // the following function was made by 4nglp
              onClick={() => {
                const { length } = entries as Entry[];
                const all = [...Array(length)].map((_, i) => i);
                const arr = all.filter((e) => !selected.includes(e));

                setSelected(arr);
              }}
            >
              inverse
            </button>
            <button
              type="button"
              disabled={
                selected.length <= 1 ||
                Math.max(...selected) - Math.min(...selected) < selected.length
              }
              onClick={() => {
                const max = Math.max(...selected);
                const min = Math.min(...selected);
                const arr = [...Array(max - min), max].map((_, i) => i + min);

                setSelected(arr);
              }}
            >
              fill
            </button>
          </div>
        </div>
      )}
    </>
  );
}
