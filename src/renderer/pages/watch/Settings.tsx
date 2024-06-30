import { useReducer, useState } from 'react';
import { Entry, Video, Source, Track } from '../../types';
import styles from '../../styles/Watch.module.css';

type Props = {
  entry: Entry;
  video: Video;
  srcIdx: number;
  trackIdx: number;
  setSrcIdx: (i: number) => void;
  setTrackIdx: (i: number) => void;
};
const {
  electron: { store },
} = window;

function Subs({
  tracks,
  trackIdx,
  setTrackIdx,
}: {
  tracks: Track[];
  trackIdx: number;
  setTrackIdx: (i: number) => void;
}) {
  return (
    <>
      <button
        type="button"
        onClick={() => setTrackIdx(-1)}
        disabled={trackIdx === -1}
      >
        <span
          style={{
            opacity: trackIdx === -1 ? 1 : 0,
            transform: `scale(${trackIdx === -1 ? 1 : 3})`,
            borderRadius: '50%',
          }}
        />
        off
      </button>
      {tracks.map((track, i) => (
        <button
          type="button"
          onClick={() => setTrackIdx(i)}
          disabled={trackIdx === i}
        >
          <span
            style={{
              opacity: trackIdx === i ? 1 : 0,
              transform: `scale(${trackIdx === i ? 1 : 3})`,
              borderRadius: '50%',
            }}
          />
          {track.label}
        </button>
      ))}
    </>
  );
}

function Quals({
  sources,
  srcIdx,
  setSrcIdx,
}: {
  sources: Source[];
  srcIdx: number;
  setSrcIdx: (i: number) => void;
}) {
  return (
    <>
      {sources.map(({ qual }, i) => (
        <button
          type="button"
          key={qual}
          onClick={() => setSrcIdx(i)}
          disabled={srcIdx === i}
        >
          <span
            style={{
              opacity: srcIdx === i ? 1 : 0,
              transform: `scale(${srcIdx === i ? 1 : 3})`,
              borderRadius: '50%',
            }}
          />
          {qual}
        </button>
      ))}
    </>
  );
}

export default function Settings({
  entry,
  video,
  srcIdx,
  trackIdx,
  setSrcIdx,
  setTrackIdx,
}: Props) {
  const [isShowQuals, setIsShowQuals] = useState(false);
  const [isShowSubs, setIsShowSubs] = useState(false);
  const [, rerender] = useReducer((n) => n + 1, 0);

  if (isShowQuals)
    return (
      <div className={styles.settings}>
        <button type="button" onClick={() => setIsShowQuals(false)}>
          {'<='}
        </button>
        <Quals sources={video.sources} srcIdx={srcIdx} setSrcIdx={setSrcIdx} />
      </div>
    );
  if (isShowSubs)
    return (
      <div className={styles.settings}>
        <button type="button" onClick={() => setIsShowSubs(false)}>
          {'<='}
        </button>
        <Subs
          tracks={video.tracks}
          trackIdx={trackIdx}
          setTrackIdx={setTrackIdx}
        />
      </div>
    );

  function toggleIsSkip(part: 'intro' | 'outro') {
    const toggle = !entry.isSkip[part];
    console.log(toggle);
    entry.isSkip[part] = toggle;
    store.set(`entries.${entry.key}.isSkip.${part}`, toggle);
    rerender();
  }

  return (
    <div className={styles.settings}>
      <div>
        <button type="button" onClick={() => toggleIsSkip('intro')}>
          <span
            style={{
              opacity: entry.isSkip.intro ? 1 : 0,
              transform: `scale(${entry.isSkip.intro ? 1 : 3})`,
            }}
          />
          Skip intro
        </button>
        <button type="button" onClick={() => toggleIsSkip('outro')}>
          <span
            style={{
              opacity: entry.isSkip.outro ? 1 : 0,
              transform: `scale(${entry.isSkip.outro ? 1 : 3})`,
            }}
          />
          Skip outro
        </button>
      </div>
      <div>
        <button type="button" onClick={() => setIsShowQuals(true)}>
          <span className={styles.arrow} />
          {video.sources[srcIdx].qual}
        </button>
      </div>
      {video.tracks.length > 0 && (
        <div>
          <button type="button" onClick={() => setIsShowSubs(true)}>
            <span className={styles.arrow} />
            {trackIdx > -1 ? video.tracks[trackIdx].label : 'Subtitles'}
          </button>
        </div>
      )}
    </div>
  );
}
