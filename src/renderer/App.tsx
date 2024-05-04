import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<h1>v0.0.1</h1>} />
      </Routes>
    </Router>
  );
}
