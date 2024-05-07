import { MemoryRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Browse from './pages/browse';
import Watch from './pages/watch';
import './App.css';

function Links() {
  return (
    <ul>
      <li>
        <Link to="/">Home</Link>
      </li>
      <li>
        <Link to="/pages/browse">Browse</Link>
      </li>
    </ul>
  );
}

export default function App() {
  return (
    <Router>
      <Links />
      <Routes>
        <Route path="/" element={<h1>v0.0.1</h1>} />
        <Route path="/pages/browse" element={<Browse />} />
        <Route path="/pages/watch" element={<Watch />} />
      </Routes>
    </Router>
  );
}
