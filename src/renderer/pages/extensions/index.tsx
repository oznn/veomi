import { Link } from 'react-router-dom';

const extensions = [
  { ext: 'fmovies', name: 'Fmovies' },
  { ext: 'aniwave', name: 'Aniwave' },
];

export default function Extensions() {
  return (
    <ul>
      {extensions.map(({ ext, name }) => (
        <li key={ext}>
          <Link to={`/browse?ext=${ext}`}>{name}</Link>
        </li>
      ))}
    </ul>
  );
}
