import { useEffect, useReducer, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Entry } from '@types';
import { useNavigate } from 'react-router-dom';
import buttonStyles from '@styles/Button.module.css';
import extensions from '../../../extensions';
import styles from './styles.module.css';
import { useAppSelector } from '../../redux/store';
import { addToLib, setEntryProp, setMediaIdx } from '../../redux';

const { electron } = window;

function Anilist({
  close,
  rerender,
}: {
  close: () => void;
  rerender: () => void;
}) {
  const app = useAppSelector((state) => state.app);
  const entry = app.entry as Entry;
  const [results, setResults] = useState([]);
  const dispatch = useDispatch();
  const [isAnime, setIsAnime] = useState(entry.result.type === 'VIDEO');
  const [search, setSearch] = useState(entry.result.title);

  useEffect(() => {
    (async () => {
      const variables = { search, page: 1, perPage: 20 };
      const query = `
        query ($id: Int, $page: Int, $perPage: Int, $search: String) {
          Page (page: $page, perPage: $perPage) {
            media (id: $id, search: $search, type:${
              isAnime ? 'ANIME' : 'MANGA'
            }) {
              id
              title {
                english
                romaji
              }
              coverImage {
                extraLarge
                medium
              }
              studios(isMain: true){
                nodes {
                    name
                }
              }
              status(version: 2)
              description(asHtml: false)
              averageScore
              format
              seasonYear
            }
          }
        }`;
      const url = 'https://graphql.anilist.co';
      const body = JSON.stringify({ query, variables });
      const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      };
      const { data } = await (await fetch(url, options)).json();
      setResults(data.Page.media);
    })();
  }, [search, isAnime]);

  if (results)
    return (
      <>
        <input
          // border: solid 3px grey;
          // border-radius: 20px;
          // padding: 0 .5em;
          style={{
            fontSize: '1em',
            border: 'solid 3px grey',
            borderRadius: '10px',
            padding: '0 .5em',
            background: 'transparent',
            color: 'silver',
            outline: 'none',
          }}
          defaultValue={search}
          placeholder="Search"
          onKeyUp={
            ({ target, key }) =>
              key === 'Enter' && setSearch((target as HTMLInputElement).value)
          }
        />
        <br />
        <button
          className={buttonStyles.container}
          type="button"
          onClick={() => setIsAnime(true)}
          disabled={isAnime}
        >
          ANIME
        </button>
        <button
          className={buttonStyles.container}
          type="button"
          onClick={() => setIsAnime(false)}
          disabled={!isAnime}
        >
          MANGA
        </button>
        <ul style={{ padding: 0 }}>
          {results.map((e: any) => (
            <button
              type="button"
              key={e.id}
              className={buttonStyles.container}
              onClick={async () => {
                const info = [
                  ['status', e.status as string],
                  ['year', e.seasonYear as string],
                  ['studio', e.studios.nodes[0]?.name as string],
                  ['format', e.format as string],
                  ['score', ((+e.averageScore as number) / 10).toFixed(2)],
                ];
                const details = {
                  info: info.filter(([, notNull]) => notNull),
                  description: e.description,
                };
                dispatch(setEntryProp({ k: 'details', v: details }));
                close();
                const path = await electron.poster.download(
                  e.coverImage.extraLarge,
                  entry.key,
                );
                if (path) {
                  dispatch(setEntryProp({ k: 'posterPath', v: path }));
                  rerender();
                }
                rerender();
              }}
              style={{
                margin: '.5em 0',
                padding: '0',
                gap: '.5em',
                display: 'flex',
                alignItems: 'center',
                width: '100%',
              }}
            >
              <img src={e.coverImage.medium} alt="cover" />
              <span style={{ padding: '0 .4em' }}>
                {e.title.english || e.title.romaji}
              </span>
            </button>
          ))}
        </ul>
      </>
    );
}
export default function Details() {
  const app = useAppSelector((state) => state.app);
  const entry = app.entry as Entry;
  const dispatch = useDispatch();
  const nav = useNavigate();
  const [isShowDetailsProviders, setIsShowDetailsProviders] = useState(false);
  const [detailsProvidersIdx, setDetailsProvidersIdx] = useState(-1);
  const [, rerender] = useReducer((n) => n + 1, 0);
  const detailsProviders = [
    <Anilist
      rerender={() => rerender()}
      close={() => {
        setIsShowDetailsProviders(false);
        setDetailsProvidersIdx(-1);
      }}
    />,
  ];

  return (
    <div className={styles.details}>
      <div>
        <img
          src={entry.posterPath || entry.result.posterURL}
          height={396}
          alt="poster"
        />
      </div>
      <div>
        <div className={styles.info}>
          <h1 title={entry.result.title} className={styles.title}>
            {entry.result.title}
          </h1>
          <div style={{ display: 'flex', gap: '0 .2em' }}>
            <span>{extensions[entry.result.ext].name}</span>
            {entry.details &&
              entry.details.info.map((e) => (
                <span key={Math.random()} title={e[0]}>
                  •{` ${e[1]} `}
                </span>
              ))}
          </div>
          <p
            // eslint-disable-next-line
            dangerouslySetInnerHTML={{
              __html: entry.details?.description || '',
            }}
          />
        </div>
        <button
          type="button"
          className={buttonStyles.container}
          disabled={entry.isInLibary}
          onClick={() => dispatch(addToLib())}
        >
          ADD
        </button>
        <button
          type="button"
          className={buttonStyles.container}
          onClick={() => {
            dispatch(
              setMediaIdx(
                Math.max(
                  0,
                  entry.media.findIndex((e) => !e.isSeen),
                ),
              ),
            );
            nav(entry.result.type === 'VIDEO' ? '/watch' : '/read');
          }}
        >
          {entry.media.some((e) => e.isSeen) ? 'RESUME' : 'START'}
        </button>
        <button
          type="button"
          className={buttonStyles.container}
          onClick={() => setIsShowDetailsProviders(true)}
        >
          DETAILS
        </button>
        {isShowDetailsProviders && (
          <div className={styles.detailsProviders}>
            <div>
              <div
                style={{
                  gap: '0 1em',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>
                  {detailsProvidersIdx > -1
                    ? 'Select entry'
                    : 'Select details provider'}
                </span>
                <button
                  onClick={() => {
                    setIsShowDetailsProviders(false);
                    setDetailsProvidersIdx(-1);
                  }}
                  type="button"
                  className={buttonStyles.container}
                  style={{ margin: 0, padding: '2px 20px' }}
                >
                  X
                </button>
              </div>
              {detailsProvidersIdx > -1 ? (
                detailsProviders[detailsProvidersIdx]
              ) : (
                <button
                  className={buttonStyles.container}
                  type="button"
                  onClick={() => setDetailsProvidersIdx(0)}
                >
                  anilsit
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
