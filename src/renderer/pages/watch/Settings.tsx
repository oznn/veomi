import { useState } from 'react';
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
      <label htmlFor="notrack">
        <input
          type="radio"
          id="notrack"
          name="track"
          defaultChecked={trackIdx === -1}
          onClick={() => setTrackIdx(-1)}
        />
        {` off `}
        <br />
      </label>
      {tracks.map((track, i) => (
        <label key={track.label} htmlFor={`track${i}`}>
          <input
            type="radio"
            id={`track${i}`}
            name="track"
            defaultChecked={trackIdx === i}
            onClick={() => setTrackIdx(i)}
          />
          {` ${track.label}`}
          <br />
        </label>
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
        <label key={qual} htmlFor={`qual${i}`}>
          <input
            type="radio"
            id={`qual${i}`}
            name="qual"
            defaultChecked={srcIdx === i}
            onClick={() => setSrcIdx(i)}
          />
          {` ${qual}`}
          <br />
        </label>
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

  if (isShowQuals)
    return (
      <div className={styles.settings}>
        <button type="button" onClick={() => setIsShowQuals(false)}>
          {'<'}
        </button>
        <br />
        <Quals sources={video.sources} srcIdx={srcIdx} setSrcIdx={setSrcIdx} />
      </div>
    );
  if (isShowSubs)
    return (
      <div className={styles.settings}>
        <button type="button" onClick={() => setIsShowSubs(false)}>
          {'<'}
        </button>
        <br />
        <Subs
          tracks={video.tracks}
          trackIdx={trackIdx}
          setTrackIdx={setTrackIdx}
        />
      </div>
    );

  function toggleIsSkip(part: 'intro' | 'outro', toggle: boolean) {
    entry.isSkip[part] = toggle;
    store.set(`entries.${entry.key}.isSkip.${part}`, toggle);
  }

  return (
    <div className={styles.settings}>
      <div>
        <label htmlFor="skipIntro">
          <input
            type="checkbox"
            onChange={({ target }) => toggleIsSkip('intro', target.checked)}
            id="skipIntro"
            defaultChecked={entry.isSkip.intro}
          />
          {` skip intro`}
        </label>
        <br />
        <label htmlFor="skipOutro">
          <input
            type="checkbox"
            onChange={({ target }) => toggleIsSkip('outro', target.checked)}
            id="skipOutro"
            defaultChecked={entry.isSkip.outro}
          />
          {` skip outro`}
        </label>
      </div>
      <div>
        <button type="button" onClick={() => setIsShowQuals(true)}>
          qual: {video.sources[srcIdx].qual}
        </button>
      </div>
      <div>
        <button type="button" onClick={() => setIsShowSubs(true)}>
          subs: {trackIdx > -1 ? video.tracks[trackIdx].label : 'off'}
        </button>
      </div>
    </div>
  );
}
