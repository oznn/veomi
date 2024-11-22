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
  const extensionsRef = useRef<HTMLButtonElement>(null);
  const [selectedExt, setSelectedExt] = useState('');
  const [isShowOptions, setIsShowOptions] = useState(false);
  const nav = useNavigate();
  const { pathname } = useLocation();
  const app = useAppSelector((state) => state.app);
  const { queue } = app;
  const [extensionQuery, setExtensionQuery] = useState('');

  useEffect(() => {
    document.onkeyup = ({ key }) => {
      const tagName = document.activeElement?.tagName;
      if (tagName === 'INPUT' || pathname === '/watch') return;
      if (key === 'L') nav('/');
      if (key === 'D') nav('/downloads');
      if (key === '/') searchRef.current?.focus();
      if (key === '?') {
        extensionsRef.current?.focus();
        setIsShowOptions(true);
        setExtensionQuery('');
      }
      if (isShowOptions) {
        if (key === ' ') {
          const [ext] = Object.keys(extensions).sort(
            (_, k) => +k.includes(extensionQuery.toLowerCase()) - 1,
          );
          setSelectedExt(ext);
          electron.store.set('selectedExt', ext);
          searchRef.current?.focus();
        }
        if (key === 'Backspace')
          setExtensionQuery((q) => q.slice(0, q.length - 1));
        if (key.length === 1) setExtensionQuery((q) => q + key);
      }
    };
  }, [isShowOptions, extensionQuery, pathname]);

  useEffect(() => {
    (async () => {
      const res = await electron.store.get('selectedExt');

      setSelectedExt(res || Object.keys(extensions)[0]);
    })();
  }, []);

  function boldCharacter(s: string) {
    const i = s.toLowerCase().indexOf(extensionQuery.toLowerCase());
    const start = s.slice(0, i);
    const end = s.slice(i + extensionQuery.length, s.length);

    if (i < 0) return s;
    return `${start}<b>${extensionQuery}</b>${end}`;
  }

  if (selectedExt)
    return (
      <nav className={styles.container}>
        <div>
          <button
            type="button"
            className={styles.arrow}
            tabIndex={0}
            onClick={() => nav(-1)}
            onKeyUp={({ key }) => key === 'Enter' && nav(-1)}
            disabled={pathname === '/'}
          >
            <img src={arrowBack} alt="icon" />
          </button>
          <Link to="/">
            Library
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
          >
            <button
              type="button"
              onClick={() => setIsShowOptions((b) => !b)}
              onBlur={() => {
                setIsShowOptions(false);
                setExtensionQuery('');
              }}
              ref={extensionsRef}
            >
              <span>{extensions[selectedExt].name}</span>
            </button>
            {isShowOptions && (
              <div
                className={styles.options}
                style={{
                  display: 'fex',
                  flexDirection: 'column',
                }}
              >
                {Object.keys(extensions)
                  .filter((k) => k !== selectedExt)
                  .toSorted(
                    (_, k) => +k.includes(extensionQuery.toLowerCase()) - 1,
                  )
                  .map((k) => (
                    <button
                      key={k}
                      type="button"
                      onMouseDown={() => {
                        setSelectedExt(k);
                        electron.store.set('selectedExt', k);
                      }}
                    >
                      <span
                        dangerouslySetInnerHTML={{
                          __html: boldCharacter(extensions[k].name),
                        }}
                      />
                    </button>
                  ))}
              </div>
            )}
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
