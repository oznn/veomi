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
  results: string[] | null;
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
        results.map((posterURL: string, i) => (
          <button
            className={resultsStyles.link}
            type="button"
            key={Math.random()}
            onClick={async () => {
              close();
              const path = await electron.poster.download(posterURL, entry.key);
              if (path) {
                rerender();
                dispatch(setEntryProp({ k: 'posterPath', v: path }));
              }
              rerender();
            }}
          >
            <div>
              <img
                style={{ transitionDelay: `${i * 10}ms` }}
                onLoad={(e) => (e.target.style.opacity = 1)}
                src={posterURL}
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
  const [results, setResults] = useState<string[] | null>([]);
  const [search, setSearch] = useState(entry.result.title);

  useEffect(() => {
    setResults(null);
    (async () => {
      const variables = { search, page: 1, perPage: 20 };
      const query = `
        query ($id: Int, $page: Int, $perPage: Int, $search: String) {
          Page (page: $page, perPage: $perPage) {
            media (id: $id, search: $search) {
              id
              coverImage {
                extraLarge
                large
              }
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
      setResults(data.Page.media.map((e: any) => e.coverImage.extraLarge));
    })();
  }, [search]);

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
      <Results results={results} close={close} rerender={rerender} />
    </>
  );
}
function Tmdb({
  close,
  rerender,
}: {
  close: () => void;
  rerender: () => void;
}) {
  const app = useAppSelector((state) => state.app);
  const entry = app.entry as Entry;
  const [results, setResults] = useState<string[] | null>([]);
  const [search, setSearch] = useState(entry.result.title);
  const tmdbApiKey =
    'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5NzE2MTk3MDQ2YWY5MDQ5NWI5NzIyYTA0MjY3ZDVjZiIsInN1YiI6IjY1Zjg0ODU5ZWY5ZDcyMDE2NWQ2MTRhZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.dIq6Jl9u5kxx5onHlKzhzFPB9lvcxBNBg0NUPv4qhZI';

  useEffect(() => {
    setResults(null);
    (async () => {
      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${tmdbApiKey}`,
        },
      };
      const url = `https://api.themoviedb.org/3/search/multi?query=${search}`;
      const res = await fetch(url, options);
      const json = await res.json();

      setResults(
        json.results.map(
          (e: any) => `https://image.tmdb.org/t/p/original/${e.poster_path}`,
        ),
      );
    })();
  }, [search]);

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
  const [posterCount, setPosterCount] = useState(0);
  const rerender = () => setPosterCount((c) => c + 1);
  const detailsProviders = [
    <Anilist
      rerender={() => rerender()}
      close={() => {
        setIsShowDetailsProviders(false);
        setDetailsProvidersIdx(-1);
      }}
    />,
    <Tmdb
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
          src={
            // eslint-disable-next-line
            (entry.posterPath || entry.result.posterURL) + '?' + posterCount
          }
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
                <>
                  <button
                    className={buttonStyles.container}
                    type="button"
                    onClick={() => setDetailsProvidersIdx(0)}
                  >
                    Anilsit
                  </button>
                  <button
                    className={buttonStyles.container}
                    type="button"
                    onClick={() => setDetailsProvidersIdx(1)}
                  >
                    TMDB
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
