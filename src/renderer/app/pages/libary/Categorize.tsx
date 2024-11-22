import useDidMountEffect from '@components/useDidMountEffect';
import styles from './styles.module.css';

const { electron } = window;

type Props = {
  close: () => void;
  categories: string[];
  setCategories: (c: string[]) => void;
  categorize: (c: string) => void;
  clearCategory: (c: string) => void;
};

export default function Categorize({
  categories,
  setCategories,
  close,
  categorize,
  clearCategory,
}: Props) {
  useDidMountEffect(
    () => electron.store.set('categories', categories),
    [categories],
  );
  function swapCategories(i1: number, i2: number) {
    [categories[i1], categories[i2]] = [categories[i2], categories[i1]];
    setCategories([...categories]);
  }

  return (
    <div className={styles.category}>
      {/* eslint-disable-next-line */}
      <span onClick={close} />
      <div>
        {categories
          .filter((c) => c)
          .map((c, i) => (
            <div
              key={c}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '.5em',
              }}
            >
              <div style={{ display: 'flex' }}>
                <div>
                  <button
                    disabled={i === 0}
                    type="button"
                    onClick={() => swapCategories(i, i - 1)}
                  >
                    <span
                      className={styles.arrow}
                      style={{ rotate: '225deg', translate: '0 25%' }}
                    />
                  </button>
                  <button
                    disabled={i === categories.length - 1}
                    type="button"
                    onClick={() => console.log('down')}
                  >
                    <span
                      className={styles.arrow}
                      style={{ translate: '0 -25%' }}
                    />
                  </button>
                </div>
              </div>

              <button type="button" onClick={() => categorize(c)}>
                {c}
              </button>
              <button
                type="button"
                style={{ width: 'auto' }}
                onClick={() => {
                  setCategories(categories.filter((_, j) => i !== j));
                  clearCategory(c);
                }}
              >
                RM
              </button>
            </div>
          ))}
        <input
          // eslint-disable-next-line
          autoFocus
          type="text"
          placeholder="Add a category"
          onKeyUp={({ key, target }) => {
            const { value } = target as HTMLInputElement;
            if (key === 'Enter') {
              (target as HTMLInputElement).value = '';
              if (
                !categories.includes(value) &&
                value.toLowerCase() !== 'default'
              )
                setCategories([...categories, value]);
            }
          }}
        />
      </div>
    </div>
  );
}
