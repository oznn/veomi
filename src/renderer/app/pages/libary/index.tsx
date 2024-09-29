import Message from '@components/message';
import { Entry } from '@types';
import { useEffect, useReducer, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Confirm from '@components/confirm';
import resultsStyles from '@styles/Results.module.css';
import buttonStyles from '@styles/Button.module.css';
import { useDispatch } from 'react-redux';
import { setEntry, setEpisodeIdx } from '../../redux';
import styles from './styles.module.css';
import extensions from '../../../extensions';
import Categorize from './Categorize';

const { electron } = window;
let entries: (Entry & { isUpdating: boolean })[] | null = null;

export default function Libary() {
  const nav = useNavigate();
  const [, rerender] = useReducer((n) => n + 1, 0);
  const dispatch = useDispatch();
  const [selected, setSelected] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isShowConfirmation, setIsShowConfirmation] = useState(false);
  const [isShowCategorization, setIsShowCategorization] = useState(false);
  const [categoryIdx, setCategoryIdx] = useState(0);

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

        const c = (await electron.store.get('categories')) || [];
        if (entries.some((e) => !e.category)) setCategories(['', ...c]);
        else setCategories(c);
      } catch (err) {
        console.log(`${err}`);
      }
    })();
  }, []);

  if (!entries) return '';
  if (!entries.length) return <Message msg="Libary is empty" />;

  async function update(s: number[]) {
    setSelected([]);
    if (entries && s.length) {
      const [e] = s;
      entries[e].isUpdating = true;
      rerender();
      await new Promise((resolve) => setTimeout(resolve, 1000)); // eslint-disable-line
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
        update(s.filter((_, i) => i !== 0));
        rerender();
      }
    }
  }

  function remove() {
    selected.forEach((k, i) => {
      if (entries) {
        const e = entries.findIndex(({ key }) => key === k);
        electron.store.delete(`entries.${entries[e - i].key}`);
        electron.poster.delete(entries[e - i].posterPath);

        const extensionName = extensions[entries[e - i].result.ext].name;
        const folderName = entries[e - i].result.title;
        electron.fs.remove(
          `[${extensionName}] ${folderName.replace(/[<>:"/\\|?*]/g, ' ')}`,
        );

        entries.splice(e - i, 1);
      }
    });

    setSelected([]);
  }

  function toggleSelect(key: string) {
    if (selected.includes(key)) setSelected(selected.filter((k) => k !== key));
    else setSelected((arr) => [...arr, key]);
  }
  function categorize(c: string) {
    selected.forEach((k) => {
      if (entries) {
        const e = entries.findIndex(({ key }) => key === k);
        entries[e].category = c;
        electron.store.set(`entries.${entries[e].key}.category`, c);
      }
    });
    if (entries && entries.every((e) => e.category))
      setCategories(categories.filter((_) => _));
    rerender();
  }

  return (
    <>
      {categories.length > 0 &&
        categories.map((c, i) => (
          <button
            disabled={i === categoryIdx}
            className={buttonStyles.container}
            key={c}
            type="button"
            onClick={() => setCategoryIdx(i)}
          >
            {c || 'DEFAULT'}
          </button>
        ))}
      <br />
      <br />
      <ul className={resultsStyles.container}>
        {entries
          .filter((e) => e.category === categories[categoryIdx])
          .map((entry) => (
            <button
              type="button"
              style={{
                background: selected.includes(entry.key) ? '#444' : '#ffffff11',
                border: `solid 3px ${
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
              onAuxClick={() => toggleSelect(entry.key)}
            >
              <div>
                <img src={entry.posterPath} alt="poster" />
              </div>
              <span className={resultsStyles.title} title={entry.result.title}>
                {entry.result.title}
              </span>
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
                    entries[entries.findIndex(({ key }) => key === selected[0])]
                      .result,
                  )}`,
                )
              }
            >
              entry
            </button>
            <button
              type="button"
              onClick={() =>
                update(
                  selected
                    .map((k) =>
                      (entries as Entry[]).findIndex(({ key }) => key === k),
                    )
                    .toSorted(),
                )
              }
            >
              update
            </button>
            <button type="button" onClick={() => setIsShowCategorization(true)}>
              categorize
            </button>
            <button type="button" onClick={() => setIsShowConfirmation(true)}>
              remove
            </button>
          </div>
          <div>
            <span style={{ color: 'grey' }}>{selected.length}</span>
          </div>
          <div>
            <button
              type="button"
              /* disabled={selected.length === entries.length} */
              disabled={
                selected.length ===
                entries.filter(
                  ({ category }) => category === categories[categoryIdx],
                ).length
              }
              onClick={() =>
                setSelected(
                  (entries as Entry[])
                    .filter((e) => e.category === categories[categoryIdx])
                    .map(({ key }) => key),
                )
              }
            >
              all
            </button>
            <button
              type="button"
              onClick={() => {
                const arr = (entries as Entry[])
                  .filter((e) => e.category === categories[categoryIdx])
                  .map(({ key }) => key)
                  .filter((k) => !selected.includes(k));

                setSelected(arr);
              }}
            >
              inverse
            </button>
          </div>
        </div>
      )}
      {categories.length && isShowCategorization && (
        <Categorize
          categories={categories}
          setCategories={(c) => setCategories(c)}
          categorize={(c) => {
            categorize(c);
            setSelected([]);
            setIsShowCategorization(false);
          }}
          close={() => setIsShowCategorization(false)}
        />
      )}
      {isShowConfirmation && (
        <Confirm
          title={`Remove all ${selected.length} selceted entries?`}
          msg="Downloaded episodes, poster and progress will also be removed!"
          cancel={() => setIsShowConfirmation(false)}
          confirm={() => {
            remove();
            setIsShowConfirmation(false);
          }}
        />
      )}
    </>
  );
}
