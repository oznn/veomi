import { Entry } from '../../types';
import styles from '../../styles/Watch.module.css';

type Props = {
  entry: Entry;
  isShow: boolean;
};
const {
  electron: { store },
} = window;

export default function Settings({ entry, isShow }: Props) {
  function toggleIsSkip(part: 'intro' | 'outro', toggle: boolean) {
    entry.isSkip[part] = toggle;
    store.set(`entries.${entry.key}.isSkip.${part}`, toggle);
  }

  return (
    <div
      className={styles.settings}
      style={{ display: isShow ? 'block' : 'none' }}
    >
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
