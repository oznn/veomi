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

function Home() {
  const valsRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      <input type="text" placeholder="vals" ref={valsRef} />
      <input
        type="text"
        placeholder="query"
        onKeyUp={({ key, target }) => {
          if (key === 'Enter' && valsRef.current) {
            const { value } = target as HTMLInputElement;
            const valsString = valsRef.current.value;
            const vals = valsString ? valsString.split(' ') : [];
            electron.send('sql-query', value, vals);
          }
        }}
      />
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
