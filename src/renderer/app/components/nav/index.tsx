import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import useDidMountEffect from '@components/useDidMountEffect';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import arrowBack from '@assets/arrowback.png';
import extensions from '../../../extensions';
import styles from './styles.module.css';
import { useAppSelector } from '../../redux/store';
import { setAddedExtensions } from '../../redux';

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
  const { addedExtensions, queue } = app;
  const [extensionQuery, setExtensionQuery] = useState('');
  const dispatch = useDispatch();

  useEffect(() => {
    document.onwheel = ({ ctrlKey, deltaY }) => {
      if (ctrlKey && deltaY > 1) electron.zoom(1);
      if (ctrlKey && deltaY < 1) electron.zoom(-1);
    };
    document.onkeyup = ({ code, key, ctrlKey }) => {
      if (ctrlKey && code === 'Equal') electron.zoom(1);
      if (ctrlKey && code === 'Minus') electron.zoom(-1);
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
      const added = (await electron.store.get('addedExtensions')) || [];

      dispatch(setAddedExtensions(added));
      if (res) setSelectedExt(res);
    })();
  }, []);
  useDidMountEffect(() => {
    if (!selectedExt) {
      setSelectedExt(addedExtensions[0]);
      electron.store.set('selectedExt', addedExtensions[0]);
    }
    if (!addedExtensions.length) {
      setSelectedExt('');
      electron.store.set('selectedExt', '');
    }
  }, [addedExtensions]);

  function boldCharacter(s: string) {
    const i = s.toLowerCase().indexOf(extensionQuery.toLowerCase());
    const start = s.slice(0, i);
    const end = s.slice(i + extensionQuery.length, s.length);

    if (i < 0) return s;
    return `${start}<b>${extensionQuery}</b>${end}`;
  }

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
        <Link to="/extensions">
          Extensions
          <sup style={{ color: 'transparent', userSelect: 'none' }}>0</sup>
        </Link>
        <Link to="/downloads">
          Downloads
          <sup style={{ color: 'grey' }}>{queue.length}</sup>
        </Link>
      </div>
      {addedExtensions.length > 0 && selectedExt && (
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
                  .filter(
                    (k) => k !== selectedExt && addedExtensions.includes(k),
                  )
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
      )}
    </nav>
  );
}
