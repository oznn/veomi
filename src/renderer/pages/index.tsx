import {
  MemoryRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
} from 'react-router-dom';
import Extensions from './extensions';
import Libary from './libary';
import Browse from './browse';
import Watch from './watch';
import Entry from './entry';
import Downloads from './downloads';
import '../styles/App.css';

function Links() {
  const nav = useNavigate();
  const f = (e: any) => {
    e.preventDefault();
    nav(-1);
  };
  return (
    <nav>
      <Link to="/" onClick={f}>
        {'<= '}
      </Link>
      <Link to="/">Libary </Link>
      <Link to="/extensions">Extensions </Link>
      <Link to="/downloads">Downloads </Link>
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
