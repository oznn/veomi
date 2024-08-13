/* eslint jsx-a11y/click-events-have-key-events: off */
/* eslint jsx-a11y/no-noninteractive-element-interactions: off */
/* eslint jsx-a11y/no-noninteractive-tabindex: off */

import {
  MemoryRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
} from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import Extensions from './extensions';
import Libary from './libary';
import Browse from './browse';
import Watch from './watch';
import Entry from './entry';
import Downloads from './downloads';
import arrowBack from '../../../assets/arrow back.png';
import extensions from './ext';
import '../styles/App.css';

const { electron } = window;
function Links() {
  const [selectedExt, setSelectedExt] = useState('');
  const nav = useNavigate();
  const searchRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    (async () => {
      const res = await electron.store.get('selectedExt');
      setSelectedExt(res || Object.keys(extensions)[0]);
    })();
  }, []);
  useEffect(() => {
    const f = ({ key }: { key: string }) =>
      key === '/' && searchRef.current?.focus();
    window.addEventListener('keyup', f);

    return () => window.removeEventListener('keyup', f);
  }, []);

  if (selectedExt)
    return (
      <nav>
        <div>
          <img
            tabIndex={0}
            onClick={() => nav(-1)}
            onKeyUp={({ key }) => key === 'Enter' && nav(-1)}
            src={arrowBack}
            alt="icon"
          />
          <Link to="/">Libary</Link>
          <Link to="/downloads">Downloads</Link>
        </div>
        <div>
          <select
            ref={searchRef}
            defaultValue={selectedExt}
            onChange={({ target }) => {
              electron.store.set('selectedExt', target.value);
              setSelectedExt(target.value);
            }}
          >
            {Object.keys(extensions).map((k) => (
              <option key={k} value={k}>
                {extensions[k].name}
              </option>
            ))}
          </select>
          <input
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

export default function App() {
  return (
    <Router>
      <Links />
      <Routes>
        <Route path="/" element={<Libary />} />
        <Route path="/extensions" element={<Extensions />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/entry" element={<Entry />} />
        <Route path="/watch" element={<Watch />} />
        <Route path="/downloads" element={<Downloads />} />
      </Routes>
    </Router>
  );
}
