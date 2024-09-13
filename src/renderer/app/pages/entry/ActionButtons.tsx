import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Entry } from '@types';
import { useAppSelector } from '../../redux/store';

const {
  electron: { store, poster },
} = window;

export default function ActionButtons() {
  const app = useAppSelector((state) => state.app);
  const entry = app.entry as Entry;
  const [isLoading, setIsLoading] = useState(false);
  const nav = useNavigate();

  async function update() {
    setIsLoading(true);

    const { getDetails, getEpisodes } = await import(
      `../../extensions/${entry.result.ext}`
    );
    const episodes = (await getEpisodes(entry.result)) || [];
    const details = (await getDetails(entry.result)) || [];

    entry.details = details;
    for (let i = 0; i < entry.episodes.length; i += 1) {
      entry.episodes[i].title = episodes[i].title;
      entry.episodes[i].info = episodes[i].info;
    }
    for (let i = entry.episodes.length; i < episodes.length; i += 1)
      entry.episodes.push(episodes[i]);

    store.set(`entries.${entry.key}`, entry);
    setIsLoading(false);
  }
  function addToLibary() {
    if (entry) {
      entry.isInLibary = true;
      store.set(`entries.${entry.key}.isInLibary`, true);
      poster.download(entry.result.posterURL, entry.key);
    }
  }
  return (
    <div
      style={{
        display: 'flex',
      }}
    >
      <button type="button" onClick={addToLibary} disabled={entry.isInLibary}>
        Add
      </button>
      <button type="button" onClick={() => nav(`/watch?key=${entry.key}`)}>
        Watch
      </button>
      <button type="button" onClick={update} disabled={isLoading}>
        Update
      </button>
    </div>
  );
}
