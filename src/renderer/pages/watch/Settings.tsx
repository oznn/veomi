import { RefObject } from 'react';
import { Entry, Video } from '../../types';
import styles from '../../styles/Watch.module.css';

type Props = {
  entry: Entry;
  video: Video;
  videoRef: RefObject<HTMLVideoElement>;
  episode: number;
  episodeKey: string;
  isShow: boolean;
  setSrc: (i: number) => void;
  setTrack: (i: number) => void;
};
const {
  electron: { store },
} = window;

export default function Settings({
  entry,
  video,
  videoRef,
  episodeKey,
  episode,
  isShow,
  setSrc,
  setTrack,
}: Props) {
  function toggleIsSkip(part: 'intro' | 'outro', toggle: boolean) {
    entry.isSkip[part] = toggle;
    store.set(`entries.${entry.key}.isSkip.${part}`, toggle);
  }

  return (
    <div className={styles.settings} style={{ opacity: isShow ? 1 : 0 }}>
      {video.tracks.length > 0 && (
        <div>
          {video.tracks.map((track, i) => (
            <label key={track.label} htmlFor={`track${i}`}>
              <input
                type="radio"
                id={`track${i}`}
                name="track"
                defaultChecked={i === 0}
                onClick={() => setTrack(i)}
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
              defaultChecked={i === 0}
              onClick={() => {
                if (videoRef.current) {
                  const { currentTime } = videoRef.current;
                  store.set(`${episodeKey}.progress`, currentTime);
                  setSrc(i);
                }
              }}
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
