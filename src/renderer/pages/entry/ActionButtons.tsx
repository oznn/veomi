import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Entry } from '../../types';
import styles from '../../styles/Entry.module.css';

type Props = {
  entry: Entry;
  rerender: () => void;
};
const {
  electron: { store, poster },
} = window;
export default function ActionButtons({ entry, rerender }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const nav = useNavigate();

  async function update() {
    setIsLoading(true);

    const { getEpisodes } = await import(
      `../../extensions/${entry.result.ext}`
    );
    const episodes = (await getEpisodes(entry.result)) || [];

    for (let i = 0; i < entry.episodes.length; i += 1) {
      entry.episodes[i].title = episodes[i].title;
      entry.episodes[i].info = episodes[i].info;
    }
    for (let i = entry.episodes.length; i < episodes.length; i += 1)
      entry.episodes.push(episodes[i]);

    store.set(`entries.${entry.key}`, entry);
    setIsLoading(false);
    rerender();
  }
  function addToLibary() {
    if (entry) {
      entry.isInLibary = true;
      store.set(`entries.${entry.key}.isInLibary`, true);
      const posterURL = entry.details?.posterURL || entry.result.posterURL;
      poster.download(posterURL, entry.key);

      rerender();
    }
  }
  return (
    <div>
      <button
        className={styles.action}
        type="button"
        onClick={addToLibary}
        disabled={entry.isInLibary}
      >
        Add
      </button>
      <button
        type="button"
        className={styles.action}
        onClick={() => nav(`/watch?key=${entry.key}`)}
      >
        {entry.episodes.some((e) => e.isSeen) ? 'Resume' : 'Start'}
      </button>
      <button
        type="button"
        className={styles.action}
        onClick={update}
        disabled={isLoading}
      >
        Update
      </button>
    </div>
  );
}
