import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Result, Entry as T } from '@types';
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
      const { getDetails, getEpisodes } = await import(
        `../../../ext/extensions/${result.ext}`
      );
      const details = await getDetails(result);
      const episodes = (await getEpisodes(result)) || [];
      const settings = await electron.store.get('settings');
      const res: T = {
        key: entryKey,
        result,
        episodes,
        details,
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
        <div className={styles.episodes}>
          {entry.episodes.map((episode, i) => (
            <button
              type="button"
              key={episode.title}
              onClick={() => {
                dispatch(setEpisodeIdx(i));
                nav('/watch');
              }}
              title={episode.info && episode.info.join(' • ')}
              onAuxClick={() => toggleSelect(i)}
              style={{ background: selected.includes(i) ? '#333' : 'none' }}
            >
              <span style={{ background: episode.isSeen ? 'grey' : 'white' }} />
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
                  dispatch(toggleIsSeen(selected));
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
                disabled={selected.length <= 1}
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

// 12
// [3,4] => [1,2,5,6,...,12]
//
