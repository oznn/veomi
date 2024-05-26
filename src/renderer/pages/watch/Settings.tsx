import { RefObject } from 'react';
import { Entry, Video } from '../../types';
import styles from '../../styles/Watch.module.css';

type Props = {
  entry: Entry;
  video: Video;
  videoRef: RefObject<HTMLVideoElement>;
  changeSrc: (i: number) => void;
  episodeKey: string;
  isShow: boolean;
};
const {
  electron: { store },
} = window;

export default function Settings({
  entry,
  video,
  videoRef,
  changeSrc,
  episodeKey,
  isShow,
}: Props) {
  function toggleIsSkip(part: 'intro' | 'outro', toggle: boolean) {
    entry.isSkip[part] = toggle;
    store.set(`entries.${entry.key}.isSkip.${part}`, toggle);
  }

  return (
    <div className={styles.settings} style={{ opacity: isShow ? 1 : 0 }}>
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
                changeSrc(i);
              }
            }}
          />
          {qual}
          <br />
        </label>
      ))}
      <br />
      <label htmlFor="skipIntro">
        <input
          type="checkbox"
          onChange={({ target }) => toggleIsSkip('intro', target.checked)}
          id="skipIntro"
          defaultChecked={entry.isSkip.intro}
        />
        skip intro
      </label>
      <br />
      <label htmlFor="skipOutro">
        <input
          type="checkbox"
          onChange={({ target }) => toggleIsSkip('outro', target.checked)}
          id="skipOutro"
          defaultChecked={entry.isSkip.outro}
        />
        skip outro
      </label>
    </div>
  );
}
