import { useRef } from 'react';
import { MemoryRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Extensions from './pages/extensions';
import Browse from './pages/browse';
import Watch from './pages/watch';
import Entry from './pages/entry';
import './App.css';

const { electron } = window;

function Links() {
  return (
    <ul>
      <li>
        <Link to="/">Home</Link>
      </li>
      <li>
        <Link to="/extensions">Extensions</Link>
      </li>
    </ul>
  );
}

async function get(k: string) {
  const res = await electron.send('store-get', k);
  console.log(res);
}
async function set(k: string, v: unknown) {
  const res = await electron.send('store-set', k, v);
  console.log(res);
}

function Home() {
  return (
    <div>
      <button type="button" onClick={() => get('k')}>
        GET
      </button>
      <button type="button" onClick={() => set('k', 'v')}>
        SET
      </button>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Links />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/extensions" element={<Extensions />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/entry" element={<Entry />} />
        <Route path="/watch" element={<Watch />} />
      </Routes>
    </Router>
  );
}
