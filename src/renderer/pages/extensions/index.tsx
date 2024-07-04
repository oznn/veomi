import { Link } from 'react-router-dom';
import extensions from '../ext';

export default function Extensions() {
  return (
    <ul>
      {Object.keys(extensions).map((ext) => (
        <li key={ext}>
          <Link to={`/browse?ext=${ext}`}>{extensions[ext].name}</Link>
        </li>
      ))}
    </ul>
  );
}
