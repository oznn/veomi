import { useDispatch } from 'react-redux';
import { useState } from 'react';
import buttonStyles from '@styles/Button.module.css';
import extensions from '../../../extensions';
import { useAppSelector } from '../../redux/store';
import { setAddedExtensions } from '../../redux';

export default function Extensions() {
  const added = useAppSelector((state) => state.app.addedExtensions);
  const categories = ['all', 'movies', 'series', 'anime', 'manga', 'live'];
  const [categoryIdx, setCategoryIdx] = useState(0);
  const dispatch = useDispatch();

  return (
    <div>
      <div
        style={{
          overflow: 'scroll',
          display: 'flex',
          paddingInline: '2em',
          gap: '.2em',
        }}
      >
        {categories.map((c, i) => (
          <button
            style={{
              fontSize: '.8em',
              background: i === categoryIdx ? '#888' : '#333',
              color: i === categoryIdx ? 'black' : 'silver',
            }}
            className={buttonStyles.container}
            key={c}
            type="button"
            // eslint-disble-next-line
            onClick={() => setCategoryIdx(i)}
          >
            {c.toUpperCase()}
          </button>
        ))}
      </div>
      <ul style={{ paddingInline: '2em', listStyle: 'none' }}>
        {Object.keys(extensions)
          .filter(
            (k) =>
              categoryIdx === 0 ||
              extensions[k].categories.includes(categories[categoryIdx]),
          )
          .map((k) => (
            <li key={k}>
              <button
                type="button"
                className={buttonStyles.container}
                style={{
                  fontSize: '.8em',
                  margin: '5px 20px',
                  padding: '5px 20px',
                  width: '1ch',
                  textAlign: 'center',
                }}
                onClick={() => {
                  if (added.includes(k))
                    dispatch(
                      setAddedExtensions(added.filter((key) => key !== k)),
                    );
                  else dispatch(setAddedExtensions([...added, k]));
                }}
              >
                {added.includes(k) ? '-' : '+'}
              </button>
              <span>{extensions[k].name} </span>
              <span style={{ fontSize: '.8em', color: 'grey' }}>
                {extensions[k].lang}
              </span>
            </li>
          ))}
      </ul>
    </div>
  );
}
