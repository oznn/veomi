import { Link } from 'react-router-dom';
import { useEffect, useReducer, useState } from 'react';
import { Entry } from '../../types';

const {
  electron: { store },
} = window;

let entries: Entry[] | null = null;
export default function Libary() {
  const [, rerender] = useReducer((n) => n + 1, 0);
  const [isLoading, setIsLoading] = useState(false);

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

  if (!entries) return '';
  if (!entries.length) return <h1>libary is empty.</h1>;

  function remove(i: number) {
    if (entries) {
      store.set(`entries.${entries[i].key}.isInLibary`, false);
      entries.splice(i, 1);
      rerender();
    }
  }
  async function update() {
    setIsLoading(true);
    if (entries) {
      const targetedEntries = entries.filter((entry) => {
        const isAllSeen = entry.episodes.every((ep) => ep.isSeen);
        return !entry.details.isCompleted && isAllSeen;
      });

      const isUpdated = await Promise.all(
        targetedEntries.map(async (entry) => {
          const { getEntry } = await import(`../../extensions/${entry.ext}`);
          const res = (await getEntry(entry.path)) as Entry | undefined;

          if (res) {
            entry.details.poster = res.details.poster;
            if (res.details.isCompleted !== null)
              entry.details.isCompleted = res.details.isCompleted;
            for (let i = 0; i < entry.episodes.length; i += 1) {
              entry.episodes[i].title = res.episodes[i].title;
              entry.episodes[i].info = res.episodes[i].info;
            }
            for (let i = entry.episodes.length; i < res.episodes.length; i += 1)
              entry.episodes.push(res.episodes[i]);
            store.set(`entries.${entry.key}`, entry);
          }
        }),
      );
      if (isUpdated) setIsLoading(false);
    }
  }

  return (
    <div>
      <button type="button" onClick={update} disabled={isLoading}>
        update
      </button>
      <ul>
        {entries.map((entry, i) => (
          <li key={entry.ext + entry.path}>
            <button type="button" onClick={() => remove(i)}>
              remove
            </button>
            <Link to={`/watch?ext=${entry.ext}&path=${entry.path}`}>
              <b> resume </b>
            </Link>
            <Link to={`/entry?ext=${entry.ext}&path=${entry.path}`}>
              {entry.details.title}
            </Link>
            <sup>{entry.episodes.filter((e) => !e.isSeen).length}</sup>
          </li>
        ))}
      </ul>
    </div>
  );
}
