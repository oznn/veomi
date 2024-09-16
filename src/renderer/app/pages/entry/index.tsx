import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Episode, Result, Entry as T } from '@types';
import Details from './Details';
import { useAppSelector } from '../../redux/store';
import {
  setEntry,
  setEpisodeIdx,
  setEpisodes,
  toggleIsSeen,
} from '../../redux';
import Loading from '../../components/loading';
import styles from './styles.module.css';

const { electron } = window;

export default function Entry() {
  const { entry } = useAppSelector(({ app }) => app);
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const result = JSON.parse(searchParams.get('result') || '{}') as Result;
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingEpisodes, setIsUpdatingEpisodes] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [order, setOrder] = useState(1);
  const nav = useNavigate();

  async function updateEpisodes() {
    if (entry) {
      setIsUpdatingEpisodes(true);

      const { getEpisodes } = await import(
        `../../../ext/extensions/${result.ext}`
      );
      const episodes = (await getEpisodes(result)) || [];

      if (episodes) {
        dispatch(setEpisodes(episodes));
        setIsUpdatingEpisodes(false);
        electron.store.set(`entries.${entry.key}.episodes`, entry.episodes);
      }
    }
  }

  function toggleSelect(i: number) {
    if (selected.includes(i)) setSelected(selected.filter((n) => n !== i));
    else setSelected((arr) => [...arr, i]);
  }

  useEffect(() => {
    dispatch(setEntry(null));
    // eslint-disable-next-line
    (async () => {
      const entryKey = (result.ext + result.path).replace(/\./g, ' ');
      const e = (await electron.store.get(`entries.${entryKey}`)) as
        | T
        | undefined;
      if (e) return dispatch(setEntry(e));

      setIsLoading(true);
      const { getEpisodes } = await import(
        `../../../ext/extensions/${result.ext}`
      );
      // const details = await getDetails(result);
      const episodes = (await getEpisodes(result)) || [];
      const settings = await electron.store.get('settings');
      const res: T = {
        key: entryKey,
        result,
        episodes,
        details: undefined,
        isInLibary: false,
        settings: settings || {
          volume: 10,
          playback: 1,
          isAutoSkip: { intro: true, outro: true },
          markAsSeenPercent: 85,
          preferredQuality: 0,
          preferredSubtitles: 'English',
          preferredServer: '',
        },
      };

      if (res) {
        setIsLoading(false);
        dispatch(setEntry(res));
      }
    })();
  }, []);

  if (isLoading) return <Loading />;

  if (entry)
    return (
      <div className={styles.container}>
        <Details />
        <span>{entry.episodes.length} Episodes </span>
        <button
          type="button"
          className={styles.button}
          style={{ fontSize: '.8em' }}
          disabled={isUpdatingEpisodes}
          onClick={updateEpisodes}
        >
          UPDATE
        </button>
        <button
          type="button"
          className={styles.button}
          style={{ fontSize: '.8em' }}
          onClick={() => setOrder((v) => (v - 1 ? 1 : -1))}
        >
          {order - 1 ? 'ASC' : 'DESC'}
        </button>
        <div className={styles.episodes}>
          {entry.episodes
            .toSorted(() => order)
            .map((episode, i) => (
              <button
                type="button"
                key={episode.title}
                onClick={() => {
                  dispatch(
                    setEpisodeIdx(
                      order - 1 ? entry.episodes.length - i - 1 : i,
                    ),
                  );
                  nav('/watch');
                }}
                title={episode.info && episode.info.join(' • ')}
                onAuxClick={() => toggleSelect(i)}
                style={{ background: selected.includes(i) ? '#333' : 'none' }}
              >
                <span
                  style={{ background: episode.isSeen ? 'grey' : 'white' }}
                />
                <span>{episode.title}</span>
              </button>
            ))}
        </div>

        {selected.length > 0 && (
          <div className={styles.options}>
            <div>
              <button
                type="button"
                onClick={() => {
                  dispatch(
                    toggleIsSeen(
                      order - 1
                        ? selected.map((e) => entry.episodes.length - e - 1)
                        : selected,
                    ),
                  );
                  setSelected([]);
                }}
              >
                toggle seen
              </button>
            </div>
            <div>
              <span style={{ color: 'grey' }}>{selected.length}</span>
            </div>
            <div>
              <button
                type="button"
                disabled={selected.length === entry.episodes.length}
                onClick={() =>
                  setSelected(
                    [...Array(entry.episodes.length)].map((_, i) => i),
                  )
                }
              >
                all
              </button>
              <button
                type="button"
                // the following function was made by 4nglp
                onClick={() => {
                  const { length } = entry.episodes;
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
                  Math.max(...selected) - Math.min(...selected) <
                    selected.length
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
      </div>
    );
}
