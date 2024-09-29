import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Queue, Result, Entry as T } from '@types';
import buttonStyles from '@styles/Button.module.css';
import Confirm from '@components/confirm';
import Details from './Details';
import { useAppSelector } from '../../redux/store';
import {
  resetEpisodesDownloads,
  setEntry,
  setEpisodeIdx,
  setEpisodes,
  setQueue,
  toggleIsSeen,
} from '../../redux';
import Loading from '../../components/loading';
import styles from './styles.module.css';
import extensions from '../../../extensions';

const { electron } = window;

export default function Entry() {
  const app = useAppSelector((state) => state.app);
  const { entry, queue } = app;
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const result = JSON.parse(searchParams.get('result') || '{}') as Result;
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingEpisodes, setIsUpdatingEpisodes] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [order, setOrder] = useState(1);
  const [isShowRemoveConfirmation, setIsShowRemoveConfirmation] =
    useState(false);
  const nav = useNavigate();
  const isCanDownload = selected
    .map((e) => `entries.${entry?.key}.episodes.${e}`)
    .some((k) => queue.findIndex((q) => q.episodeKey === k) === -1);

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
        category: '',
        settings: settings || {
          volume: 10,
          playbackRate: 1,
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

  function download() {
    if (entry) {
      const items: Queue = selected
        .map((i) => (order - 1 ? entry.episodes.length - i - 1 : i))
        .map((episodeIdx) => ({
          entryKey: entry.key,
          episodeIdx,
          entryTitle: entry.result.title,
          episodeKey: `entries.${entry.key}.episodes.${episodeIdx}`,
          episodeTitle: entry.episodes[episodeIdx].title,
          progress: 0,
          isFailed: false,
        }))
        .filter(
          (e) => queue.findIndex((q) => q.episodeKey === e.episodeKey) === -1,
        );

      dispatch(setQueue((queue as Queue).concat(items)));
      setSelected([]);
      electron.ffmpeg.start();
    }
  }

  function removeDownloads() {
    if (entry) {
      electron.fs.remove(
        `[${extensions[entry.result.ext].name}] ${entry.result.title.replace(
          /[<>:"/\\|?*]/g,
          ' ',
        )}`,
      );
      dispatch(resetEpisodesDownloads());
    }
  }

  if (isLoading) return <Loading />;
  if (entry)
    return (
      <div className={styles.container}>
        <Details />
        <span>{entry.episodes.length} Episodes </span>
        <button
          type="button"
          className={buttonStyles.container}
          style={{ fontSize: '.8em' }}
          disabled={isUpdatingEpisodes}
          onClick={updateEpisodes}
        >
          UPDATE
        </button>
        <button
          type="button"
          className={buttonStyles.container}
          style={{ fontSize: '.8em' }}
          onClick={() => {
            setOrder((v) => (v - 1 ? 1 : -1));
            setSelected((a) => a.map((i) => entry.episodes.length - i - 1));
          }}
        >
          {order - 1 ? 'ASC' : 'DESC'}
        </button>
        <button
          type="button"
          onClick={() => setIsShowRemoveConfirmation(true)}
          disabled={!entry.episodes.some((e) => e.downloaded)}
          style={{ fontSize: '.8em' }}
          className={buttonStyles.container}
        >
          REMOVE DOWNLOADS
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
                {episode.downloaded && <span>DOWNLOADED</span>}
                {queue.findIndex(
                  (q) => q.episodeKey === `entries.${entry.key}.episodes.${i}`,
                ) !== -1 && <span>IN QUEUE</span>}
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
              <button
                type="button"
                onClick={download}
                disabled={!isCanDownload}
              >
                download
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
        {isShowRemoveConfirmation && (
          <Confirm
            title={`DELETE ALL ${entry.episodes.reduce(
              (p, c) => p + (c.downloaded ? 1 : 0),
              0,
            )} DOWNLOADED EPISODES?`}
            msg="SUBTITLES WILL ALSO BE REMOVED"
            cancel={() => setIsShowRemoveConfirmation(false)}
            confirm={() => {
              removeDownloads();
              setIsShowRemoveConfirmation(false);
            }}
          />
        )}
      </div>
    );
}
