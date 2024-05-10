import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { baseURL } from '../../utils';

type Extension = { path: string; name: string };
export default function Extensions() {
  const [extensions, setExtensions] = useState<Extension[] | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const url = `${baseURL}/extensions`;
        const res = await (await fetch(url)).json();

        setExtensions(res);
      } catch (err) {
        console.log(`${err}`);
      }
    })();
  }, []);

  if (extensions === null) return <h1>loading extensions...</h1>;
  if (extensions.length === 0) return <h1>0 extensions.</h1>;
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
