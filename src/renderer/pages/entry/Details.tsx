import { Entry } from '../../types';
import extensions from '../ext';
import styles from '../../styles/Entry.module.css';
import ActionButtons from './ActionButtons';

export default function Details({ entry }: { entry: Entry }) {
  const { details } = entry;

  if (details)
    return (
      <div className={styles.banner}>
        <div>
          <img
            height={400}
            src={entry.posterPath || details.posterURL}
            alt="poster"
          />
        </div>
        <div>
          <div className={styles.info}>
            <span title={entry.result.title} className={styles.title}>
              {entry.result.title}
            </span>
            <span>
              {[
                details.status,
                details.studio,
                extensions[entry.result.ext].name,
              ].join(' • ')}
            </span>
            <p dangerouslySetInnerHTML={{ __html: details.description }} />
          </div>
          <ActionButtons entry={entry} />
        </div>
      </div>
    );

  return (
    <div className={styles.banner}>
      <div>
        <img
          height={400}
          src={entry.posterPath || entry.result.posterURL}
          alt="poster"
        />
      </div>
      <div>
        <div className={styles.info}>
          <span title={entry.result.title} className={styles.title}>
            {entry.result.title}
          </span>
        </div>
        <ActionButtons entry={entry} />
      </div>
    </div>
  );
}
