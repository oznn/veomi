import buttonStyles from '@styles/Button.module.css';
import styles from './styles.module.css';

type Props = {
  title: string;
  msg: string;
  cancel: () => void;
  confirm: () => void;
};

export default function Confirm({ title, msg, cancel, confirm }: Props) {
  return (
    <div className={styles.container}>
      <div>
        <span style={{ fontWeight: 'bold' }}>
          {title}
          <br />
          <span style={{ color: 'grey', fontSize: '.7em' }}>{msg}</span>
        </span>
        <br />
        <div className={styles.buttons}>
          <button
            className={buttonStyles.container}
            type="button"
            onClick={cancel}
          >
            Cancel
          </button>
          <button
            className={buttonStyles.container}
            type="button"
            onClick={confirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
