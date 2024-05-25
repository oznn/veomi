import { Entry } from '../../types';

type Props = {
  entry: Entry;
};
const {
  electron: { store },
} = window;

export default function Settings({ entry }: Props) {
  function toggleIsSkip(part: 'intro' | 'outro', toggle: boolean) {
    entry.isSkip[part] = toggle;
    store.set(`entries.${entry.key}.isSkip.${part}`, toggle);
  }

  return (
    <div>
      <label htmlFor="skipIntro">
        <input
          type="checkbox"
          onChange={({ target }) => toggleIsSkip('intro', target.checked)}
          id="skipIntro"
          defaultChecked={entry.isSkip.intro}
        />
        skip intro
      </label>
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
