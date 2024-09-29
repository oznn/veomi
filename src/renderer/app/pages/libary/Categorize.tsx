import useDidMountEffect from '@components/useDidMountEffect';
import styles from './styles.module.css';

const { electron } = window;

type Props = {
  close: () => void;
  categories: string[];
  setCategories: (c: string[]) => void;
  categorize: (c: string) => void;
};

export default function Categorize({
  categories,
  setCategories,
  close,
  categorize,
}: Props) {
  useDidMountEffect(() => {
    electron.store.set(
      'categories',
      categories.filter((c) => c),
    );
  }, [categories]);

  return (
    <div className={styles.category}>
      {/* eslint-disable-next-line */}
      <span onClick={close} />
      <div>
        Move selected entries
        {categories
          .filter((c) => c)
          .map((c, i) => (
            <div key={c} style={{ display: 'flex' }}>
              <button type="button" onClick={() => categorize(c)}>
                <span style={{ borderRadius: '50%' }} />
                {c}
              </button>
              <button
                type="button"
                style={{ width: 'auto' }}
                onClick={() =>
                  setCategories(categories.filter((_, j) => i !== j))
                }
              >
                RM
              </button>
            </div>
          ))}
        <input
          type="text"
          placeholder="add category"
          onKeyUp={({ key, target }) => {
            const { value } = target as HTMLInputElement;
            if (key === 'Enter') {
              (target as HTMLInputElement).value = '';
              if (!categories.includes(value))
                setCategories([...categories, value]);
            }
          }}
        />
      </div>
    </div>
  );
}
