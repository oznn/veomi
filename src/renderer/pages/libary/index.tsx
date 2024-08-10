import { useEffect, useReducer } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Entry } from '../../types';
import resultsStyles from '../../styles/Results.module.css';

const {
  electron: { store, poster },
} = window;

let entries: Entry[] | null = null;
export default function Libary() {
  const nav = useNavigate();
  const [, rerender] = useReducer((n) => n + 1, 0);
  // const [isLoading, setIsLoading] = useState(false);

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
  if (!entries.length)
    return (
      <span
        style={{
          display: 'block',
          textAlign: 'center',
        }}
      >
        Libary is empty
      </span>
    );

  function remove(i: number) {
    if (entries) {
      store.delete(`entries.${entries[i].key}`);
      poster.delete(entries[i].posterPath);
      entries.splice(i, 1);
      rerender();
    }
  }
  // async function update() {
  //   setIsLoading(true);
  //   if (entries) {
  //     const targetedEntries = entries.filter((entry) => {
  //       const isAllSeen = entry.episodes.every((ep) => ep.isSeen);
  //       return !entry.details.isCompleted && isAllSeen;
  //     });
  //
  //     const isUpdated = await Promise.all(
  //       targetedEntries.map(async (entry) => {
  //         const { getEntry } = await import(`../../extensions/${entry.ext}`);
  //         const res = (await getEntry(entry.path)) as Entry | undefined;
  //
  //         if (res) {
  //           if (res.details.isCompleted !== null)
  //             entry.details.isCompleted = res.details.isCompleted;
  //           for (let i = 0; i < entry.episodes.length; i += 1) {
  //             entry.episodes[i].title = res.episodes[i].title;
  //             entry.episodes[i].info = res.episodes[i].info;
  //           }
  //           for (let i = entry.episodes.length; i < res.episodes.length; i += 1)
  //             entry.episodes.push(res.episodes[i]);
  //           store.set(`entries.${entry.key}`, entry);
  //         }
  //       }),
  //     );
  //     if (isUpdated) setIsLoading(false);
  //   }
  // }

  // async function f() {
  //   const query = `
  //           query ($id: Int, $search: String) {
  //               Media (id: $id, search: $search, type: ANIME) {
  //                 id
  //                 title {
  //                   english
  //                 }
  //               }
  //           }
  //   `;
  //   const variables = {
  //     perPage: 1,
  //     page: 1,
  //     search: 'love is war',
  //   };
  //   const url = 'https://graphql.anilist.co';
  //   const body = JSON.stringify({ query, variables });
  //   const options = {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body,
  //   };
  //   try {
  //     const res = await fetch(url, options);
  //     const { data } = await res.json();
  //     console.log('data', data);
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }
  return (
    <ul className={resultsStyles.container}>
      {entries.map((entry, i) => (
        <Link
          key={entry.key}
          to={`/entry?key=${entry.key}`}
          className={resultsStyles.link}
          onAuxClick={({ button }) =>
            button - 1 ? nav(`/watch?key=${entry.key}`) : remove(i)
          }
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
