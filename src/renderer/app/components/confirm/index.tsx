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
        <span style={{ fontWeight: 'bold' }}>{title}</span>
        <span style={{ fontSize: '.8em', color: 'silver' }}>{msg}</span>
        <div className={styles.buttons}>
          <button
            className={buttonStyles.container}
            type="button"
            onClick={cancel}
          >
            CANCEL
          </button>
          <button
            className={buttonStyles.container}
            type="button"
            onClick={confirm}
          >
            CONFIRM
          </button>
        </div>
      </div>
    </div>
  );
}
