import { Link } from 'react-router-dom';

const extensions = [{ path: 'aniwave', name: 'Aniwave' }];

export default function Extensions() {
  return (
    <ul>
      {extensions.map(({ path, name }) => (
        <li key={path}>
          <Link to={`/browse?ext=${path}`}>{name}</Link>
        </li>
      ))}
    </ul>
  );
}
