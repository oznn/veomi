import { useEffect, useState } from 'react';
import Entries from './Entries';
import { Extension, Entry } from '../../types';
import { ext } from '../../utils';

export default function Browse() {
  const [extensions, setExtensions] = useState<Extension[]>([]);
  const [extension, setExtension] = useState(-1);
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await (await fetch(ext.url)).json();

        setExtensions(res.extensions);
      } catch (err) {
        console.log(`${err}`);
      }
    })();
  }, []);

  useEffect(() => {
    if (extension === -1) return;

    (async () => {
      try {
        ext.path = extensions[extension].path;
        const url = `${ext.url}/${ext.path}/entries?sort=latest`;
        const res = await (await fetch(url)).json();

        setEntries(res.entries);
      } catch (err) {
        console.log(`${err}`);
      }
    })();
  }, [extensions, extension]);

  return (
    <div>
      <ul>
        {extensions.map(({ path, name }, i) => (
          <li key={path}>
            <input
              type="radio"
              name="extension"
              id={path}
              onClick={() => setExtension(i)}
            />
            <label htmlFor={path}>{name}</label>
          </li>
        ))}
      </ul>
      {extension > -1 && <Entries entries={entries} />}
    </div>
  );
}
