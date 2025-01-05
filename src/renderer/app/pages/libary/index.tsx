import Message from '@components/message';
import { Entry } from '@types';
import { useEffect, useReducer, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Confirm from '@components/confirm';
import resultsStyles from '@styles/Results.module.css';
import buttonStyles from '@styles/Button.module.css';
import { useDispatch } from 'react-redux';
import { setCategoryIdx, setEntry, setMediaIdx } from '../../redux';
import styles from './styles.module.css';
import extensions from '../../../extensions';
import Categorize from './Categorize';
import Download from './Download';
import { useAppSelector } from '../../redux/store';

const { electron } = window;
let entries: (Entry & { isUpdating: boolean })[] | null = null;

export default function Libary() {
  const nav = useNavigate();
  const [, rerender] = useReducer((n) => n + 1, 0);
  const dispatch = useDispatch();
  const { categoryIdx, entryRefresh } = useAppSelector((state) => state.app);
  const [selected, setSelected] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isShowConfirmation, setIsShowConfirmation] = useState(false);
  const [isShowCategorization, setIsShowCategorization] = useState(false);
  const [isShowDownload, setIsShowDownload] = useState(false);
  const isUseCategories = entries
    ? entries.some((e) => !categories.includes(e.category))
    : false;

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

        setCategories((await electron.store.get('categories')) || []);
      } catch (err) {
        console.log(`${err}`);
      }
    })();
  }, [entryRefresh]);

  if (!entries) return '';
  if (!entries.length) return <Message msg="Libary is empty" />;

  async function update(s: number[]) {
    setSelected([]);
    if (entries && s.length) {
      const [e] = s;
      entries[e].isUpdating = true;
      rerender();
      await new Promise((resolve) => setTimeout(resolve, 200)); // eslint-disable-line
      const { result } = entries[e];
      const { getMedia } = await import(
        `../../../ext/extensions/${result.ext}`
      );
      const media = await getMedia(result);
      if (media) {
        for (let i = 0; i < entries[e].media.length; i += 1) {
          entries[e].media[i].title = media[i].title;
          entries[e].media[i].info = media[i].info;
          entries[e].media[i].id = media[i].id;
        }
        for (let i = entries[e].media.length; i < media.length; i += 1)
          entries[e].media.push(media[i]);

        const k = `entries.${entries[e].key}.media`;
        electron.store.set(k, entries[e].media);

        entries[e].isUpdating = false;
        update(s.filter((_, i) => i !== 0));
        rerender();
      }
    }
  }

  function remove() {
    selected.forEach((k) => {
      if (entries) {
        const e = entries.findIndex(({ key }) => key === k);
        electron.store.delete(`entries.${entries[e].key}`);
        electron.poster.delete(entries[e].posterPath);

        const extensionName = extensions[entries[e].result.ext].name;
        const folderName = entries[e].result.title;
        electron.fs.remove(
          `[${extensionName}] ${folderName.replace(/[<>:"/\\|?*]/g, ' ')}`,
        );

        entries.splice(e, 1);
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
    dispatch(setCategoryIdx(0));
  }

  function clearCategory(c: string) {
    if (entries)
      entries.forEach((_, i) => {
        if (entries && entries[i].category === c) {
          entries[i].category = '';
          electron.store.set(`entries.${entries[i].key}.category`, '');
        }
      });
    dispatch(setCategoryIdx(0));
  }
  return (
    <>
      <div
        style={{
          overflow: 'scroll',
          display: 'flex',
          paddingInline: '2em',
          gap: '.2em',
        }}
      >
        {entries.some((e) => e.category) &&
          (isUseCategories ? ['', ...categories] : categories).map((c, i) => (
            <button
              style={{
                fontSize: '.8em',
                background: i === categoryIdx ? '#888' : '#333',
                color: i === categoryIdx ? 'black' : 'silver',
                transition: 'all 200ms ease',
              }}
              className={buttonStyles.container}
              key={c}
              type="button"
              // eslint-disble-next-line
              disabled={entries ? entries.some((e) => e.isUpdating) : false}
              onClick={() => {
                if (entries) {
                  const s = entries
                    .filter(
                      (e) =>
                        e.category ===
                        (isUseCategories ? ['', ...categories] : categories)[
                          categoryIdx
                        ],
                    )
                    .map((e) => e.key);
                  const target = s
                    .map((k) =>
                      (entries as Entry[]).findIndex(({ key }) => key === k),
                    )
                    .toSorted();
                  if (i === categoryIdx) update(target);
                  else dispatch(setCategoryIdx(i));
                }
              }}
            >
              {c || 'DEFAULT'}
            </button>
          ))}
      </div>
      <ul className={resultsStyles.container}>
        {entries
          .filter(
            (e) =>
              e.category ===
              (isUseCategories ? ['', ...categories] : categories)[categoryIdx],
          )
          .map((entry, i) => (
            <button
              type="button"
              style={{
                background: selected.includes(entry.key) ? '#444' : '#222',
                translate: entry.isUpdating ? '0 -8%' : '0',
              }}
              key={entry.key}
              className={resultsStyles.link}
              onClick={() => {
                const n = entry.media.findIndex((e) => !e.isSeen);

                dispatch(setMediaIdx(Math.max(0, n)));
                dispatch(setEntry(entry));
                nav(entry.result.type === 'VIDEO' ? '/watch' : '/read');
              }}
              onAuxClick={() => toggleSelect(entry.key)}
            >
              <div>
                <img
                  src={`${entry.posterPath}?${new Date().getTime()}`}
                  alt="poster"
                  style={{ transitionDelay: `${i * 10}ms` }}
                  onLoad={(e) => {
                    (e.target as HTMLImageElement).style.opacity = '1';
                  }}
                />
              </div>
              <span className={resultsStyles.title} title={entry.result.title}>
                {entry.result.title}
              </span>
              <span className={resultsStyles.remaining}>
                {entry.media.filter((e) => !e.isSeen).length}
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
            <button type="button" onClick={() => setIsShowDownload(true)}>
              download
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
              disabled={
                selected.length ===
                entries.filter(
                  (e) =>
                    categories.length === 0 ||
                    e.category ===
                      (isUseCategories ? ['', ...categories] : categories)[
                        categoryIdx
                      ],
                ).length
              }
              onClick={() =>
                setSelected(
                  (entries as Entry[])
                    .filter(
                      (e) =>
                        categories.length === 0 ||
                        e.category ===
                          (isUseCategories ? ['', ...categories] : categories)[
                            categoryIdx
                          ],
                    )
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
                  .filter(
                    (e) =>
                      categories.length === 0 ||
                      e.category ===
                        (isUseCategories ? ['', ...categories] : categories)[
                          categoryIdx
                        ],
                  )
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
      {isShowDownload && (
        <Download
          entries={entries.filter((e) => selected.includes(e.key))}
          close={() => {
            setSelected([]);
            setIsShowDownload(false);
          }}
        />
      )}
      {isShowCategorization && (
        <Categorize
          categories={categories}
          setCategories={(c) => setCategories(c)}
          categorize={(c) => {
            categorize(c);
            setSelected([]);
            setIsShowCategorization(false);
          }}
          clearCategory={(c: string) => clearCategory(c)}
          close={() => {
            setIsShowCategorization(false);
            setSelected([]);
          }}
        />
      )}
      {isShowConfirmation && (
        <Confirm
          title={`Remove ${selected.length} selceted ${
            selected.length > 1 ? 'entries' : 'entry'
          }?`}
          msg="Downloads, poster and progress will also be removed!"
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
