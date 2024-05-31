import { Link } from 'react-router-dom';
import { useEffect, useReducer } from 'react';
import { Entry } from '../../types';

const {
  electron: { store },
} = window;

let entries: Entry[] | null = null;
export default function Libary() {
  const [, rerender] = useReducer((n) => n + 1, 0);

  useEffect(() => {
    (async () => {
      try {
        const res = Object.values(await store.get('entries')) as Entry[];
        entries = res.filter((e) => e.isInLibary);
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

  return (
    <ul>
      {entries.map((entry, i) => (
        <li key={entry.ext + entry.path}>
          <Link to={`/watch?ext=${entry.ext}&path=${entry.path}`}>
            {entry.details.title}
          </Link>
          <Link to={`/entry?ext=${entry.ext}&path=${entry.path}`}>
            <i>
              <b> entry page </b>
            </i>
          </Link>
          <button type="button" onClick={() => deleteFromLibary(i)}>
            delete
          </button>
        </li>
      ))}
    </ul>
  );
}
