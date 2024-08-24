import { Entry } from '../../types';
import extensions from '../ext';
import styles from '../../styles/Entry.module.css';
import ActionButtons from './ActionButtons';

type Props = {
  entry: Entry;
  rerender: () => void;
};
export default function Details({ entry, rerender }: Props) {
  const { details } = entry;

  if (details)
    return (
      <div className={styles.banner}>
        <div>
          <img
            src={entry.posterPath || entry.result.posterURL}
            height={396}
            alt="poster"
          />
        </div>
        <div>
          <div className={styles.info}>
            <h1 title={entry.result.title} className={styles.title}>
              {entry.result.title}
            </h1>
            <span>
              {[extensions[entry.result.ext].name, ...details.info].join(' • ')}
            </span>
            <p dangerouslySetInnerHTML={{ __html: details.description }} />
          </div>
          <ActionButtons entry={entry} rerender={() => rerender()} />
        </div>
      </div>
    );

  return (
    <div className={styles.banner}>
      <div>
        <img
          height={396}
          src={entry.posterPath || entry.result.posterURL}
          alt="poster"
        />
      </div>
      <div>
        <div className={styles.info}>
          <span title={entry.result.title} className={styles.title}>
            {entry.result.title}
          </span>
          <span>{extensions[entry.result.ext].name}</span>
          <p />
        </div>
        <ActionButtons entry={entry} rerender={() => rerender()} />
      </div>
    </div>
  );
}
