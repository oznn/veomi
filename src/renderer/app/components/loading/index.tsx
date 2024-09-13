import styles from './styles.module.css';

// eslint-disable-next-line
export default function Loading({ centerY }: { centerY?: boolean }) {
  return (
    <div
      className={styles.container}
      style={
        centerY
          ? {
              position: 'absolute',
              top: '50%',
              left: '50%',
              translate: '-50% -50%',
            }
          : {}
      }
    />
  );
}
