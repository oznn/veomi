import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import arrowBack from '@assets/arrowback.png';
import extensions from '../../../extensions';
import styles from './styles.module.css';

const { electron } = window;
export default function Nav() {
  const searchRef = useRef<HTMLInputElement>(null);
  const [selectedExt, setSelectedExt] = useState('');
  const [isShowOptions, setIsShowOptions] = useState(false);
  const nav = useNavigate();
  const { pathname } = useLocation();

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
          <Link to="/">Libary</Link>
          <Link to="/downloads">Downloads</Link>
        </div>
        <div>
          {/* <div>
             <div
              className={styles.select}
              onBlur={() => setIsShowOptions(false)}
            >
              <button type="button" onClick={() => setIsShowOptions((b) => !b)}>
                {extensions[selectedExt].name}
                <img
                  src={arrowDown}
                  width={24}
                  height={24}
                  alt="icon"
                  style={{ rotate: isShowOptions ? '180deg' : '0deg' }}
                />
              </button>
              <div className={styles.optoins}>
                {Object.keys(extensions)
                  .filter((k) => k !== selectedExt)
                  .map((k, i) => (
                    <button
                      style={{
                        opacity: Number(isShowOptions),
                        transitionDelay: `${12 * i}ms`,
                        pointerEvents: isShowOptions ? 'auto' : 'none',
                      }}
                      key={k}
                      type="button"
                      onMouseDown={() => setSelectedExt(k)}
                    >
                      {extensions[k].name}
                      <img
                        src={arrowDown}
                        width={24}
                        height={24}
                        alt="icon"
                        style={{ opacity: 0 }}
                      />
                    </button>
                  ))}
              </div>
            </div>
          </div> */}
          <input
            ref={searchRef}
            type="text"
            placeholder="Search"
            onKeyUp={({ key, target }) => {
              if (key === 'Enter') {
                const q = (target as HTMLInputElement).value;
                (target as HTMLInputElement).value = '';
                if (q) nav(`/browse?query=${q}&ext=${'hianime'}`);
              }
            }}
          />
        </div>
      </nav>
    );
}
