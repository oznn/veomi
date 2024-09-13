import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import Nav from './components/nav';
import Libary from './pages/libary';
import Browse from './pages/browse';
import Entry from './pages/entry';
import Watch from './pages/watch';
import Downloads from './pages/downloads';
import { store } from './redux/store';
import './index.css';

export default function App() {
  return (
    <Router>
      <Provider store={store}>
        <Nav />
        <br />
        <Routes>
          <Route path="/" element={<Libary />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/entry" element={<Entry />} />
          <Route path="/watch" element={<Watch />} />
          <Route path="/downloads" element={<Downloads />} />
        </Routes>
        <br />
      </Provider>
    </Router>
  );
}
