import { vrfEncrypt, vrfDecrypt } from './utils';
import vidsrcExtractor from '../../extractors/vidsrc';
import { Result, Entry, Episode, Server } from '../../types';

const baseURL = 'https://fmovies24.to';
const ext = 'fmovies';
const parser = new DOMParser();
const parse = (html: string) => parser.parseFromString(html, 'text/html');
const { electron } = window;

export async function getResults(query: string) {
  const res = await fetch(`${baseURL}/filter?keyword=${query}`);
  const doc = parse(await res.text());
  const results: Result[] = [];
  const items = doc.querySelectorAll('.movies.items > .item');

  items.forEach((item) => {
    const path = item.querySelector('a')?.getAttribute('href') || '';
    const title = item.querySelector('.meta a')?.textContent || '';
    const poster = item.querySelector('img')?.getAttribute('data-src') || '';

    results.push({ title, poster, path, ext });
  });

  return results;
}

async function getEpisodes(dataId: string) {
  const vrf = vrfEncrypt(dataId);
  const reqUrl = `${baseURL}/ajax/episode/list/${dataId}?vrf=${vrf}`;
  const res = await fetch(reqUrl, { referrer: baseURL });
  const { result } = await res.json();
  const doc = parse(result);

  const episodes: Episode[] = [];
  doc.querySelectorAll('ul.episodes').forEach((ul, i) => {
    ul.querySelectorAll('a').forEach((a, j) => {
      const isTv = a.getAttribute('href')?.includes('/tv/') ? 1 : 0;
      const epTitle = a.querySelectorAll('span')[isTv].textContent || '';
      const isNoEpTitle = /[Episode]\s\d/.test(epTitle);
      const title = isNoEpTitle
        ? `S${i + 1} Episode${j + 1}`
        : `S${i + 1} E${j + 1}. ${epTitle}`;
      const info: string[] = [];
      const releaseDate = a.getAttribute('title') || '';
      const id = a.getAttribute('data-id');

      info.push(releaseDate);
      episodes.push({
        title: isTv ? title : 'Movie',
        info,
        isSeen: false,
        progress: 0,
        id,
      });
    });
  });

  return episodes;
}

async function getDetails(path: string) {
  const res = await fetch(baseURL + path);
  const doc = parse(await res.text());
  const dataId = doc.querySelector('.watch')?.getAttribute('data-id') || '';
  const title = doc.querySelector('h1.name')?.textContent || '';

  return { title, poster: '', isCompleted: null, dataId };
}
export async function getEntry(path: string): Promise<Entry> {
  const details = await getDetails(path);
  const episodes = await getEpisodes(details.dataId);

  return {
    details,
    episodes,
    isInLibary: false,
    isSkip: { intro: true, outro: true },
    volume: 10,
    path,
    ext: 'fmovies',
    key: `fmovies${path}`.replace(/\./g, ' '),
    preferredSubs: 'off',
    preferredQual: '1080p',
    preferredServ: '[sub] Vidplay',
  };
}

export async function getServers(episode: Episode) {
  const episodeId = episode.id || '';
  const vrf = vrfEncrypt(episodeId);
  const reqUrl = `${baseURL}/ajax/server/list/${episodeId}?vrf=${vrf}`;
  const res = await fetch(reqUrl, { referrer: baseURL });
  const html = (await res.json()).result;
  const doc = parse(html);
  const servers: Server[] = [];
  const supportedServers = ['Vidplay', 'MyCloud'];

  doc.querySelectorAll('li').forEach((li) => {
    const id = li.getAttribute('data-link-id') || '';
    const serverName = li.querySelector('span')?.textContent || '';
    if (supportedServers.includes(serverName))
      servers.push({
        name: `[softsub] ${serverName}`,
        id,
        episodeId: episode.id,
      });
  });

  return servers;
}

export async function getVideo(server: Server) {
  const serverId = server.id || '';
  const serverName = server.name ? server.name.split(' ')[1] : '';
  const vrf = vrfEncrypt(serverId);
  const reqUrl = `${baseURL}/ajax/server/${serverId}?vrf=${vrf}`;
  const res = await fetch(reqUrl, { referrer: baseURL });
  const { result } = await res.json();
  const embedUrl = vrfDecrypt(result.url);
  const skips = result.skip_data;
  const origin = `https://${new URL(embedUrl).hostname}`;

  electron.ipcRenderer.sendMessage('change-origin', origin);

  switch (serverName) {
    case 'Vidplay':
    case 'MyCloud': {
      const sourcesAndTracks = await vidsrcExtractor(embedUrl);
      const tracksURL = `${baseURL}/ajax/episode/subtitles/${server.episodeId}`;
      const tracks = await (await fetch(tracksURL)).json();

      return { ...sourcesAndTracks, tracks, skips };
    }
    default:
      return null;
  }
}
