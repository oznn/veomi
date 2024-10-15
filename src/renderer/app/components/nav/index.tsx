import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import arrowBack from '@assets/arrowback.png';
import extensions from '../../../extensions';
import styles from './styles.module.css';
import { useAppSelector } from '../../redux/store';

const { electron } = window;
const width = `${
  Math.max(...Object.values(extensions).map(({ name }) => name.length)) + 1
}ch`;

export default function Nav() {
  const searchRef = useRef<HTMLInputElement>(null);
  const [selectedExt, setSelectedExt] = useState('');
  const [isShowOptions, setIsShowOptions] = useState(false);
  const nav = useNavigate();
  const { pathname } = useLocation();
  const app = useAppSelector((state) => state.app);
  const { queue } = app;

  useEffect(() => {
    document.onkeyup = ({ key }) => key === '/' && searchRef.current?.focus();
    (async () => {
      const res = await electron.store.get('selectedExt');

      setSelectedExt(res || Object.keys(extensions)[0]);
    })();
  }, []);

  if (selectedExt)
    return (
      <nav className={styles.container}>
        <div>
          <button
            type="button"
            tabIndex={0}
            onClick={() => nav(-1)}
            onKeyUp={({ key }) => key === 'Enter' && nav(-1)}
            disabled={pathname === '/'}
          >
            <img src={arrowBack} alt="icon" />
          </button>
          <Link to="/">
            Libary
            <sup style={{ color: 'transparent', userSelect: 'none' }}>0</sup>
          </Link>
          <Link to="/downloads">
            Downloads
            <sup style={{ color: 'grey' }}>{queue.length}</sup>
          </Link>
        </div>
        <div>
          <div
            className={styles.select}
            style={{
              width,
              background: isShowOptions ? '#111' : 'transparent',
            }}
            onBlur={() => setIsShowOptions(false)}
          >
            <button type="button" onClick={() => setIsShowOptions((b) => !b)}>
              {extensions[selectedExt].name}
            </button>
            {isShowOptions &&
              Object.keys(extensions)
                .filter((k) => k !== selectedExt)
                .map((k) => (
                  <button
                    key={k}
                    type="button"
                    onMouseDown={() => {
                      setSelectedExt(k);
                      electron.store.set('selectedExt', k);
                    }}
                  >
                    {extensions[k].name}
                  </button>
                ))}
          </div>
          <input
            ref={searchRef}
            type="text"
            placeholder="Search"
            onKeyUp={({ key, target }) => {
              if (key === 'Enter') {
                const q = (target as HTMLInputElement).value;
                (target as HTMLInputElement).value = '';
                if (q) nav(`/browse?query=${q}&ext=${selectedExt}`);
              }
            }}
          />
        </div>
      </nav>
    );
}
