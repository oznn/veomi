import Loading from '@components/loading';
import { useEffect, useReducer, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Entry } from '@types';
import { useNavigate } from 'react-router-dom';
import buttonStyles from '@styles/Button.module.css';
import resultsStyles from '@styles/Results.module.css';
import styles from './styles.module.css';
import { useAppSelector } from '../../redux/store';
import { addToLib, setEntryProp, setMediaIdx } from '../../redux';

const { electron } = window;
type ResultType = {
  results: Object[] | null;
  close: () => void;
  rerender: () => void;
};

function Results({ results, close, rerender }: ResultType) {
  const dispatch = useDispatch();
  const app = useAppSelector((s) => s.app);
  const entry = app.entry as Entry;
  if (!results) return <Loading />;

  return (
    <ul style={{ margin: '1em 0' }} className={resultsStyles.container}>
      {!results.length ? (
        <span style={{ display: 'block', textAlign: 'center' }}>
          No results found
        </span>
      ) : (
        results.map((e: any) => (
          <button
            className={resultsStyles.link}
            type="button"
            key={e.id}
            onClick={async () => {
              close();
              const path = await electron.poster.download(
                e.coverImage.extraLarge,
                entry.key,
              );
              if (path) {
                rerender();
                dispatch(setEntryProp({ k: 'posterPath', v: path }));
              }
              rerender();
            }}
          >
            <div>
              <img
                src={e.coverImage.large}
                alt="cover"
                height={333}
                width={222}
              />
            </div>
          </button>
        ))
      )}
    </ul>
  );
}

function Anilist({
  close,
  rerender,
}: {
  close: () => void;
  rerender: () => void;
}) {
  const app = useAppSelector((state) => state.app);
  const entry = app.entry as Entry;
  const [results, setResults] = useState<Object[] | null>([]);
  const [isAnime, setIsAnime] = useState(entry.result.type === 'VIDEO');
  const [search, setSearch] = useState(entry.result.title);

  useEffect(() => {
    setResults(null);
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
                large
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

  return (
    <>
      <input
        style={{
          fontSize: '1em',
          border: 'solid 3px grey',
          borderRadius: '20px',
          padding: '.2em .5em',
          margin: '.2em 0',
          background: 'transparent',
          color: 'silver',
          outline: 'none',
          width: '100%',
        }}
        defaultValue={search}
        placeholder="Search"
        onKeyUp={({ target, key }) =>
          key === 'Enter' && setSearch((target as HTMLInputElement).value)
        }
      />
      <br />
      <button
        className={buttonStyles.container}
        type="button"
        onClick={() => setIsAnime(true)}
        disabled={isAnime}
        style={{ fontSize: '.8em' }}
      >
        ANIME
      </button>
      <button
        className={buttonStyles.container}
        type="button"
        onClick={() => setIsAnime(false)}
        disabled={!isAnime}
        style={{ fontSize: '.8em' }}
      >
        MANGA
      </button>
      <Results results={results} close={close} rerender={rerender} />
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
          style={{
            borderRadius: '20px',
            display: 'block',
            padding: '0 0 5px 0',
          }}
          src={entry.posterPath || entry.result.posterURL}
          height={333}
          width={222}
          alt="poster"
        />
      </div>
      <div>
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
          POSTER
        </button>
        {isShowDetailsProviders && (
          <div className={styles.detailsProviders}>
            <span
              className={styles.backdrop}
              onClick={() => {
                setIsShowDetailsProviders(false);
                setDetailsProvidersIdx(-1);
              }}
            />
            <div>
              <div
                style={{
                  gap: '0 1em',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <p>
                  {detailsProvidersIdx > -1
                    ? 'Select poster'
                    : 'Select database'}
                </p>
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
