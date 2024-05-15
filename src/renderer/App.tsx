import { MemoryRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Extensions from './pages/extensions';
import Libary from './pages/libary';
import Browse from './pages/browse';
import Watch from './pages/watch';
import Entry from './pages/entry';
import './App.css';

function Links() {
  return (
    <ul>
      <li>
        <Link to="/">Libary</Link>
      </li>
      <li>
        <Link to="/extensions">Extensions</Link>
      </li>
    </ul>
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
      </Routes>
    </Router>
  );
}
