import { Video, Episode, Result, Server } from '@types';
import { parse } from 'hls-parser';
import { MasterPlaylist } from 'hls-parser/types';
import vidsrcExtractor from '../../extractors/vidsrc';

const { electron } = window;
const baseURL = 'https://vidsrc.net';
const apiURL = 'https://vidsrc.stream';
const ext = 'vidsrc';
const parser = new DOMParser();
const parseHTML = (html: string) => parser.parseFromString(html, 'text/html');
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
          id: `${result.path}/${i}-${j + 1}`,
          title: `S${i} E${j + 1}. ${episode.name}`,
          isSeen: false,
          currentTime: 0,
        });
    }
  }

  return episodes;
}

export async function getServers(episodeId: string): Promise<Server[]> {
  return [{ name: 'vidsrc', id: `${baseURL}/embed/${episodeId}` }];
}

export async function getVideo(server: Server): Promise<Video | undefined> {
  const res = await fetch(server.id);
  const doc = parseHTML(await res.text());
  const url = doc.querySelector('#player_iframe')?.getAttribute('src') || '';
  const base = new URL(`https:${url}`).origin;
  const txt = await (await fetch(`https:${url}`)).text();
  console.log('b',base);
  console.log(txt);
  const [, path] = /src: '(.*?)'/.exec(txt) || ['', ''];
  const doc2 = parseHTML(await (await fetch(base + path)).text());
  const div = doc2.querySelector('#reporting_content+div');
  const method = div?.getAttribute('id') || '';
  const encodedMaster = div?.textContent || '';
  const master = vidsrcExtractor(method, encodedMaster) || '';
  electron.ipcRenderer.sendMessage('change-referrer', `https:${url}`);
  const playlist = parse(await (await fetch(master)).text());

  const sources = (playlist as MasterPlaylist).variants
    .filter((t) => !t.isIFrameOnly)
    .map(({ uri, resolution }) => ({
      file: uri.includes('://')
        ? uri
        : url.slice(0, url.lastIndexOf('/') + 1) + uri,
      qual: resolution?.height || 0,
    }))
    .toSorted((a, b) => b.qual - a.qual);
  return { sources };
}

// export async function getVideo(server: Server): Promise<Video | undefined> {
//   const res = await fetch(server.id);
//   const doc = parseHTML(await res.text());
//   const servers = doc.querySelectorAll('.server');
//   const hashList = [...servers].map((e) => e.getAttribute('data-hash') || '');
//
//   // electron.ipcRenderer.sendMessage('change-referrer', apiURL);
//   for (let i = 0; i < hashList.length; i += 1) {
//     // eslint-disable-next-line
//     const html = await (await fetch(`${apiURL}/rcp/${hashList[i]}`)).text();
//     const [, path] = /src: '(.*?)'/.exec(html) || ['', ''];
//     // eslint-disable-next-line
//     console.log('path', path);
//     // console.log(await fetch(`https:${path}`));
//   }
//   // const html = await (await fetch(`${apiURL}/rcp/${hash}`)).text();
//   // const [, path] = /src: '(.*?)'/.exec(html) || ['', ''];
//   // electron.ipcRenderer.sendMessage('change-referrer', apiURL);
//   // console.log('PATH', path);
//   // console.log(await (await fetch(`https://${path}`)).text());
// }
//
