import { vrfEncrypt, vrfDecrypt } from './utils';
import vidsrcExtractor from '../../extractors/vidsrc';
import mp4uploadExtractor from '../../extractors/mp4upload';
import { Result, Entry, Episode, Server } from '../../../types';

const baseURL = 'https://aniwave.to';
const ext = 'aniwave';
const parser = new DOMParser();
const parse = (html: string) => parser.parseFromString(html, 'text/html');
const { electron } = window;

export async function getResults(query: string) {
  const res = await fetch(`${baseURL}/filter?keyword=${query}`);
  const doc = parse(await res.text());
  const results: Result[] = [];
  const items = doc.querySelectorAll('.ani.items > .item');

  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];
    const path = item.querySelector('a.name')?.getAttribute('href') || '';
    const title = item.querySelector('a.name')?.textContent || '';
    const poster = item.querySelector('img')?.getAttribute('src') || '';
    let id = item.querySelector('.ani.poster')?.getAttribute('data-tip') || '';
    id = id.slice(0, id?.indexOf('?'));

    results.push({ title, poster, path, ext, id });
  }

  return results;
}

async function getEpisodes(dataId: string) {
  const vrf = vrfEncrypt(dataId);
  const reqUrl = `${baseURL}/ajax/episode/list/${dataId}?vrf=${vrf}`;
  const res = await fetch(reqUrl, { referrer: baseURL });
  const { result } = await res.json();
  const doc = parse(result);

  const episodes: Episode[] = [];
  doc.querySelectorAll('a').forEach((a, i) => {
    const info: string[] = [];
    const id = a.getAttribute('data-ids') || '';
    const infoString = a.parentElement?.getAttribute('title') || '';
    const epTitle = a.querySelector('.d-title')?.textContent || '';
    const [releaseDate] = /\d{4}\/\d{2}\/\d{2}/.exec(infoString) || [''];
    const types: string[] = [];
    const isFiller = infoString.includes('Filler');
    ['Sub', 'Softsub', 'Dub'].forEach((type) => {
      if (infoString.includes(type)) types.push(type);
    });

    if (isFiller) info.push('Filler');
    info.push(releaseDate);
    info.push(types.join(','));

    episodes.push({
      title: `E${i + 1}. ${epTitle}`,
      info,
      isSeen: false,
      progress: 0,
      id,
    });
  });

  return episodes;
}

export async function getEntry(result: Result): Promise<Entry> {
  const details = { title: result.title, poster: result.poster };
  const episodes = await getEpisodes(result.id);

  return {
    details,
    episodes,
    isInLibary: false,
    key: result.ext + result.path,
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

  doc.querySelectorAll('.type').forEach((server) => {
    const type = server.getAttribute('data-type');
    server.querySelectorAll('li').forEach((li) => {
      const id = li.getAttribute('data-link-id') || '';
      const serverName = li.textContent;
      servers.push({ name: `[${type}] ${serverName}`, id });
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
  const skips = vrfDecrypt(result.skip_data);
  const origin = `https://${new URL(embedUrl).hostname}`;
  let sourcesAndTracks;

  electron.ipcRenderer.sendMessage('change-origin', origin);

  switch (serverName) {
    case 'Vidplay':
    case 'MyCloud':
      sourcesAndTracks = await vidsrcExtractor(embedUrl);
      break;
    case 'Mp4upload':
      sourcesAndTracks = await mp4uploadExtractor(embedUrl);
      break;
    default:
    // no default
  }

  return { ...sourcesAndTracks, skips: JSON.parse(skips) };
}
