import { Link } from 'react-router-dom';
import { useEffect, useReducer, useState } from 'react';
import { Entry } from '../../types';

const {
  electron: { store },
} = window;

let entries: Entry[] | null = null;
export default function Libary() {
  const [, rerender] = useReducer((n) => n + 1, 0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await store.get('entries');
        const allEntries = Object.values(res || {}) as Entry[];

        entries = allEntries.filter((e) => e.isInLibary);
        rerender();
      } catch (err) {
        console.log(`${err}`);
      }
    })();
  }, []);

  if (!entries || !entries.length) return <h1>libary is empty.</h1>;

  function deleteFromLibary(i: number) {
    if (entries) {
      store.set(`entries.${entries[i].key}.isInLibary`, false);
      entries.splice(i, 1);
      rerender();
    }
  }
  async function refreshLibary() {
    setIsRefreshing(true);
    if (entries) {
      const targetedEntries = entries.filter((e) => {
        const isAllSeen = e.episodes.every((ep) => ep.isSeen);
        return e.details.isCompleted && isAllSeen;
      });

      for (const entry of targetedEntries) { // eslint-disable-line
        const { getEntry } = await import(`../../extensions/${entry.ext}`);// eslint-disable-line
        const res = (await getEntry(entry.path)) as Entry | undefined;// eslint-disable-line

        if (res) {
          entry.details.poster = res.details.poster;
          entry.details.isCompleted = res.details.isCompleted;
          entry.episodes = entry.episodes.concat(
            res.episodes.splice(entry.episodes.length, res.episodes.length),
          );
          store.set(`entries.${entry.key}`, entry);
          setIsRefreshing(false);
        }
      }
    }
  }

  return (
    <div>
      <button type="button" onClick={refreshLibary} disabled={isRefreshing}>
        refresh libary
      </button>
      <ul>
        {entries.map((entry, i) => (
          <li key={entry.ext + entry.path}>
            <Link to={`/entry?ext=${entry.ext}&path=${entry.path}`}>
              {entry.details.title}
            </Link>
            <sup>{entry.episodes.filter((e) => !e.isSeen).length}</sup>
            <Link to={`/watch?ext=${entry.ext}&path=${entry.path}`}>
              <b> resume </b>
            </Link>
            <button type="button" onClick={() => deleteFromLibary(i)}>
              delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
