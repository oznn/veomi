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

        entries = allEntries.filter((entry) => entry.isInLibary);
        rerender();
      } catch (err) {
        console.log(`${err}`);
      }
    })();
  }, []);

  if (!entries || !entries.length) return <h1>libary is empty.</h1>;

  function remove(i: number) {
    if (entries) {
      store.set(`entries.${entries[i].key}.isInLibary`, false);
      entries.splice(i, 1);
      rerender();
    }
  }
  async function refresh() {
    setIsRefreshing(true);
    if (entries) {
      const targetedEntries = entries.filter((entry) => {
        const isAllSeen = entry.episodes.every((ep) => ep.isSeen);
        return !entry.details.isCompleted && isAllSeen;
      });

      const isRefreshed = await Promise.all(
        targetedEntries.map(async (entry) => {
          const { getEntry } = await import(`../../extensions/${entry.ext}`);
          const res = (await getEntry(entry.path)) as Entry | undefined;

          if (res) {
            entry.details.poster = res.details.poster;
            entry.details.isCompleted = res.details.isCompleted;
            entry.episodes = entry.episodes.concat(
              res.episodes.splice(entry.episodes.length, res.episodes.length),
            );
            store.set(`entries.${entry.key}`, entry);
          }
        }),
      );
      if (isRefreshed) setIsRefreshing(false);
    }
  }

  return (
    <div>
      <button type="button" onClick={refresh} disabled={isRefreshing}>
        refresh
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
            <button type="button" onClick={() => remove(i)}>
              remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
