import { useDispatch } from 'react-redux';
import { Entry } from '@types';
import { useNavigate } from 'react-router-dom';
import buttonStyles from '@styles/Button.module.css';
import extensions from '../../../extensions';
import styles from './styles.module.css';
import { useAppSelector } from '../../redux/store';
import { addToLib, setEpisodeIdx } from '../../redux';

export default function Details() {
  const app = useAppSelector((state) => state.app);
  const entry = app.entry as Entry;
  const dispatch = useDispatch();
  const nav = useNavigate();

  return (
    <div className={styles.details}>
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
            {[extensions[entry.result.ext].name]
              .concat(entry.details ? entry.details.info : [])
              .join(' • ')}
          </span>
          <p
            // eslint-disable-next-line
            dangerouslySetInnerHTML={{
              __html: entry.details?.description || '',
            }}
          />
        </div>
        <button
          type="button"
          className={buttonStyles.container}
          disabled={entry.isInLibary}
          onClick={() => dispatch(addToLib())}
        >
          ADD
        </button>
        <button
          type="button"
          className={buttonStyles.container}
          onClick={() => {
            dispatch(
              setEpisodeIdx(
                Math.max(
                  0,
                  entry.episodes.findIndex((e) => !e.isSeen),
                ),
              ),
            );
            nav('/watch');
          }}
        >
          {entry.episodes.some((e) => e.isSeen) ? 'RESUME' : 'START'}
        </button>
        {/* <ActionButtons entry={entry} rerender={() => rerender()} /> */}
      </div>
    </div>
  );
}
