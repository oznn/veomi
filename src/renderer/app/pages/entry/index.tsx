import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Queue, Result, Entry as T } from '@types';
import buttonStyles from '@styles/Button.module.css';
import Confirm from '@components/confirm';
import Details from './Details';
import { useAppSelector } from '../../redux/store';
import {
  removeDownloadedMedia,
  setEntry,
  setMediaIdx,
  setMedia,
  setQueue,
  toggleIsSeen,
  setEntryProp,
} from '../../redux';
import Loading from '../../components/loading';
import styles from './styles.module.css';
import extensions from '../../../extensions';

const { electron } = window;

export default function Entry() {
  const app = useAppSelector((state) => state.app);
  const { entry, queue, entryRefresh } = app;
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const resultString = searchParams.get('result') || '{}';
  const result = JSON.parse(decodeURIComponent(resultString)) as Result;
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingMedia, setIsUpdatingMedia] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [isShowRemoveConfirmation, setIsShowRemoveConfirmation] =
    useState(false);
  const nav = useNavigate();
  const isCanDownload = selected
    .map((e) => `entries.${entry?.key}.media.${e}`)
    .some((k) => queue.findIndex((q) => q.mediaKey === k) === -1);

  async function updateMedia() {
    if (entry) {
      setIsUpdatingMedia(true);

      const { getMedia } = await import(
        `../../../ext/extensions/${result.ext}`
      );
      const media = (await getMedia(result)) || [];

      if (media) {
        dispatch(setMedia(media));
        setIsUpdatingMedia(false);
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
      const key = (result.ext + result.path).replace(/\./g, ' ');
      const e = (await electron.store.get(`entries.${key}`)) as T | undefined;
      if (e) return dispatch(setEntry(e));

      setIsLoading(true);
      const { getMedia } = await import(
        `../../../ext/extensions/${result.ext}`
      );
      const media = (await getMedia(result)) || [];
      const defaultPlayerSettings = {
        volume: 10,
        playbackRate: 1,
        isAutoSkip: { intro: true, outro: true },
        isShowSubtitles: true,
        markAsSeenPercent: 90,
        timeJump: 85,
        preferredQuality: 1080,
        preferredSubtitles: 'English',
        preferredServer: '',
        subtitlesFont: {
          size: 100,
          opacity: 100,
          shadowStrokeSize: 5,
          yAxisOffset: 5,
        },
      };
      const defaultReaderSettings = {
        mode: 'rtl',
        sliderZoom: 0,
        yScrollFactor: 1,
        gapSize: 5,
        longStripZoom: 0,
      };
      const settings =
        result.type === 'VIDEO'
          ? (await electron.store.get('playerSettings')) ||
            defaultPlayerSettings
          : (await electron.store.get('readerSettings')) ||
            defaultReaderSettings;
      const res: T = {
        key,
        result,
        media,
        settings,
        isDesc: false,
        isInLibary: false,
        category: '',
      };

      if (res) {
        setIsLoading(false);
        dispatch(setEntry(res));
      }
    })();
  }, [entryRefresh]);

  function download() {
    if (entry) {
      const items: Queue = selected
        .map((i) => (entry.isDesc ? entry.media.length - i - 1 : i))
        .map((mediaIdx) => ({
          entryKey: entry.key,
          mediaIdx,
          entryTitle: entry.result.title,
          mediaKey: `entries.${entry.key}.media.${mediaIdx}`,
          mediaTitle: entry.media[mediaIdx].title,
          mediaType: entry.result.type,
          progress: 0,
          isFailed: false,
        }))
        .filter(
          (e) => queue.findIndex((q) => q.mediaKey === e.mediaKey) === -1,
        );
      dispatch(setQueue((queue as Queue).concat(items)));
      setSelected([]);
      if (!queue.length) electron.download.start();
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
      dispatch(removeDownloadedMedia());
    }
  }

  if (isLoading) return <Loading />;
  if (entry)
    return (
      <>
        <h3 style={{ margin: '0', padding: '0 0 0 40px', lineHeight: 1.4 }}>
          {entry.result.title}
        </h3>
        <div className={styles.container}>
          <Details />
          <div style={{ width: '100%' }}>
            <span>
              {entry.media.length}{' '}
              {entry.result.type === 'VIDEO' ? 'Episodes' : 'Chapters'}{' '}
            </span>
            <button
              type="button"
              className={buttonStyles.container}
              style={{ fontSize: '.8em', margin: '0 .2em' }}
              disabled={isUpdatingMedia}
              onClick={updateMedia}
            >
              UPDATE
            </button>
            <button
              type="button"
              className={buttonStyles.container}
              style={{ fontSize: '.8em', margin: '0 .2em' }}
              onClick={() => {
                dispatch(setEntryProp({ k: 'isDesc', v: !entry.isDesc }));
                setSelected((a) => a.map((i) => entry.media.length - i - 1));
              }}
            >
              {entry.isDesc ? 'ASC' : 'DESC'}
            </button>
            <button
              type="button"
              onClick={() => setIsShowRemoveConfirmation(true)}
              disabled={!entry.media.some((e) => e.downloaded)}
              style={{ fontSize: '.8em', margin: '0 .2em' }}
              className={buttonStyles.container}
            >
              REMOVE DOWNLOADS
            </button>
            <div className={styles.media}>
              {entry.media
                .toSorted(() => (entry.isDesc ? -1 : 1))
                .map((media, i) => (
                  <button
                    type="button"
                    key={media.id + media.title}
                    onClick={() => {
                      dispatch(
                        setMediaIdx(
                          entry.isDesc ? entry.media.length - i - 1 : i,
                        ),
                      );
                      nav(entry.result.type === 'VIDEO' ? '/watch' : '/read');
                    }}
                    title={media.info && media.info.join(' • ')}
                    onAuxClick={() => toggleSelect(i)}
                    style={{
                      background: selected.includes(i) ? '#333' : 'none',
                    }}
                  >
                    <span
                      style={{ background: media.isSeen ? 'grey' : 'white' }}
                    />
                    {media.downloaded && <span>DOWNLOADED</span>}
                    {queue.findIndex(
                      (q) =>
                        q.mediaKey ===
                        `entries.${entry.key}.media.${
                          entry.isDesc ? entry.media.length - i - 1 : i
                        }`,
                    ) !== -1 && <span>IN QUEUE</span>}
                    <span>{media.title}</span>
                  </button>
                ))}
            </div>
          </div>

          {selected.length > 0 && (
            <div className={styles.options}>
              <div>
                <button
                  type="button"
                  onClick={() =>
                    dispatch(
                      toggleIsSeen({
                        arr: entry.isDesc
                          ? selected.map((e) => entry.media.length - e - 1)
                          : selected,
                        val: true,
                      }),
                    )
                  }
                  disabled={selected.every((s) => entry.media[s].isSeen)}
                >
                  seen
                </button>
                <button
                  type="button"
                  onClick={() =>
                    dispatch(
                      toggleIsSeen({
                        arr: entry.isDesc
                          ? selected.map((e) => entry.media.length - e - 1)
                          : selected,
                        val: false,
                      }),
                    )
                  }
                  disabled={selected.every((s) => !entry.media[s].isSeen)}
                >
                  unseen
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
                  disabled={selected.length === entry.media.length}
                  onClick={() =>
                    setSelected([...Array(entry.media.length)].map((_, i) => i))
                  }
                >
                  all
                </button>
                <button
                  type="button"
                  // the following function was made by 4nglp
                  onClick={() => {
                    const { length } = entry.media;
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
                    const arr = [...Array(max - min), max].map(
                      (_, i) => i + min,
                    );

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
              title="Remove all downloads?"
              msg={
                entry.result.type === 'VIDEO'
                  ? 'SUBTITLES WILL ALSO BE REMOVED'
                  : ''
              }
              cancel={() => setIsShowRemoveConfirmation(false)}
              confirm={() => {
                removeDownloads();
                setIsShowRemoveConfirmation(false);
              }}
            />
          )}
        </div>
      </>
    );
}
