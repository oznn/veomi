import Message from '@components/message';
import { Entry } from '@types';
import { useEffect, useReducer, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import buttonStyles from '@styles/Button.module.css';
import confirmStyles from '@styles/Confirm.module.css';
import resultsStyles from '@styles/Results.module.css';
import { useDispatch } from 'react-redux';
import { setEntry, setEpisodeIdx } from '../../redux';
import styles from './styles.module.css';
import extensions from '../../../extensions';

const { electron } = window;
let entries: (Entry & { isUpdating: boolean })[] | null = null;
export default function Libary() {
  const nav = useNavigate();
  const [, rerender] = useReducer((n) => n + 1, 0);
  const dispatch = useDispatch();
  const [selected, setSelected] = useState<number[]>([]);
  const [isShowRemoveConfirmation, setIsShowRemoveConfirmation] =
    useState(false);
  // const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await electron.store.get('entries');
        const allEntries = Object.values(res || {}) as (Entry & {
          isUpdating: boolean;
        })[];

        entries = allEntries
          .filter((entry) => entry.isInLibary)
          .map((e) => ({ ...e, isUpdating: false }));
        rerender();
      } catch (err) {
        console.log(`${err}`);
      }
    })();
  }, []);

  if (!entries) return '';
  if (!entries.length) return <Message msg="Libary is empty" />;

  async function update(s: number[]) {
    if (entries && s.length) {
      const [e] = s;
      entries[e].isUpdating = true;
      rerender();
      const { getEpisodes } = await import(
        `../../../ext/extensions/${entries[e].result.ext}`
      );
      const episodes = await getEpisodes(entries[e].result);
      if (episodes) {
        for (let i = 0; i < entries[e].episodes.length; i += 1) {
          entries[e].episodes[i].title = episodes[i].title;
          entries[e].episodes[i].info = episodes[i].info;
        }
        for (let i = entries[e].episodes.length; i < episodes.length; i += 1)
          entries[e].episodes.push(episodes[i]);

        const k = `entries.${entries[e].key}.episodes`;
        electron.store.set(k, entries[e].episodes);

        entries[e].isUpdating = false;
        rerender();
        setTimeout(() => update(s.filter((_, i) => i !== 0)), 1000);
      }
    }
  }

  function remove() {
    selected.forEach((i) => {
      if (entries) {
        electron.store.delete(`entries.${entries[i].key}`);
        electron.poster.delete(entries[i].posterPath);

        const extensionName = extensions[entries[i].result.ext].name;
        const folderName = entries[i].result.title;
        electron.fs.remove(
          `[${extensionName}] ${folderName.replace(/[<>:"/\\|?*]/g, ' ')}`,
        );
        entries.splice(i, 1);
      }
    });
    rerender();
  }

  function toggleSelect(i: number) {
    if (selected.includes(i)) setSelected(selected.filter((n) => n !== i));
    else setSelected((arr) => [...arr, i]);
  }

  return (
    <>
      <ul className={resultsStyles.container}>
        {entries.map((entry, i) => (
          <button
            type="button"
            style={{
              background: selected.includes(i) ? '#444' : '#ffffff11',
              border: `solid 2px ${
                entry.isUpdating ? 'silver' : 'transparent'
              }`,
            }}
            key={entry.key}
            className={resultsStyles.link}
            onClick={() => {
              const n = entry.episodes.findIndex((e) => !e.isSeen);

              dispatch(setEpisodeIdx(Math.max(0, n)));
              dispatch(setEntry(entry));
              nav('/watch');
            }}
            onAuxClick={() => toggleSelect(i)}
          >
            <div>
              <img src={entry.posterPath} alt="poster" />
            </div>
            <span title={entry.result.title}>{entry.result.title}</span>
            <span className={resultsStyles.remaining}>
              {entry.episodes.filter((e) => !e.isSeen).length}
            </span>
          </button>
        ))}
      </ul>
      {selected.length > 0 && (
        <div className={styles.options}>
          <div>
            <button
              type="button"
              disabled={selected.length > 1}
              onClick={() =>
                entries &&
                nav(
                  `/entry?result=${JSON.stringify(
                    entries[selected[0]].result,
                  )}`,
                )
              }
            >
              entry
            </button>
            <button
              type="button"
              onClick={() => setIsShowRemoveConfirmation(true)}
            >
              remove
            </button>
            <button type="button" onClick={() => update(selected)}>
              update
            </button>
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
      {isShowRemoveConfirmation && (
        <div className={confirmStyles.container}>
          <div>
            <span style={{ fontWeight: 'bold' }}>
              REMOVE ALL {selected.length} SELCETED ENTRIES
              <br />
              <span style={{ color: 'grey', fontSize: '.7em' }}>
                DOWNLOADED EPISODES, POSTER AND PROGRESS WILL ALSO BE REMOVED!
              </span>
            </span>
            <br />
            <div style={{ textAlign: 'center' }}>
              <button
                className={buttonStyles.container}
                type="button"
                onClick={() => {
                  remove();
                  setIsShowRemoveConfirmation(false);
                }}
              >
                CONFIRM
              </button>
              <button
                className={buttonStyles.container}
                type="button"
                onClick={() => setIsShowRemoveConfirmation(false)}
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
