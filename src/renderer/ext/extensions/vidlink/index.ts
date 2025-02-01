import { Video, Episode, Result, Server } from '@types';
import embedExtractor from '../../extractors/embed';
import getSources from '../../utils/getSourcesFromPlaylist';

const baseURL = 'https://vidlink.pro';
const ext = 'vidlink';
const tmdbApiKey =
  'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5NzE2MTk3MDQ2YWY5MDQ5NWI5NzIyYTA0MjY3ZDVjZiIsInN1YiI6IjY1Zjg0ODU5ZWY5ZDcyMDE2NWQ2MTRhZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.dIq6Jl9u5kxx5onHlKzhzFPB9lvcxBNBg0NUPv4qhZI';

export async function getResults(q: string): Promise<Result[]> {
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${tmdbApiKey}`,
    },
  };
  const url = `https://api.themoviedb.org/3/search/multi?query=${q}`;
  const res = await fetch(url, options);
  const json = await res.json();

  return json.results.map((e: any) => ({
    title: e.name || e.title,
    posterURL: `https://image.tmdb.org/t/p/w342/${e.poster_path}`,
    path: `${e.media_type}/${e.id}`,
    ext,
    type: 'VIDEO',
  }));
}

export async function getMedia(result: Result): Promise<Episode[]> {
  const [type, id] = result.path.split('/');
  console.log('ass');

  if (type === 'movie')
    return [{ title: 'Movie', id: result.path, currentTime: 0, isSeen: false }];
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${tmdbApiKey}`,
    },
  };

  const url = `https://api.themoviedb.org/3/tv/${id}`;
  const res = await fetch(url, options);
  const { seasons } = await res.json();
  const episodes: Episode[] = [];

  for (let i = 1; i < seasons.length; i += 1) {
    // eslint-disable-next-line
    const season = await (await fetch(`${url}/season/${i}`, options)).json();
    for (let j = 0; j < season.episodes.length; j += 1) {
      const episode = season.episodes[j];
      if (episode.runtime !== null)
        episodes.push({
          id: `${result.path}/${i}/${j + 1}`,
          title: `S${i} E${j + 1}. ${episode.name}`,
          isSeen: false,
          currentTime: 0,
        });
    }
  }

  return episodes;
}

export async function getServers(episodeId: string): Promise<Server[]> {
  console.log(`${baseURL}/embed/${episodeId}`);
  return [{ name: 'vidlink', id: `${baseURL}/${episodeId}` }];
}

export async function getVideo(server: Server): Promise<Video | undefined> {
  const [url] = await embedExtractor(server.id, [`${baseURL}/api/b`]);
  const { stream } = await (await fetch(url)).json();
  const tracks = stream.captions.map((t: any) => ({
    file: t.url,
    label: t.language,
  }));
  const sources = await getSources(stream.playlist);

  return { tracks, sources };
}
