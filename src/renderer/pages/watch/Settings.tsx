import { Entry, Video } from '../../types';
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

export default function Settings({
  entry,
  video,
  srcIdx,
  trackIdx,
  setSrcIdx,
  setTrackIdx,
}: Props) {
  function toggleIsSkip(part: 'intro' | 'outro', toggle: boolean) {
    entry.isSkip[part] = toggle;
    store.set(`entries.${entry.key}.isSkip.${part}`, toggle);
  }

  return (
    <div className={styles.settings}>
      {video.tracks.length > 0 && (
        <div>
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
          {video.tracks.map((track, i) => (
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
        </div>
      )}
      <div>
        {video.sources.map(({ qual }, i) => (
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
      </div>
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
    </div>
  );
}
