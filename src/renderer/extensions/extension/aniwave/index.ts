import { vrfEncrypt, vrfDecrypt } from './utils';
import vidsrcExtractor from '../../extractors/vidsrc';
import mp4uploadExtractor from '../../extractors/mp4upload';
import { Entry, Episode, Server } from '../../../types';

const baseURL = 'https://aniwave.to';
const parser = new DOMParser();
const parse = (html: string) => parser.parseFromString(html, 'text/html');
const { electron } = window;

export async function getEntries(
  sort: 'popular' | 'latest',
  keyword = '',
  page = 1,
) {
  const url = new URL(`${baseURL}/filter`);
  type SortMap = { [k: string]: string };
  const sortMap: SortMap = { popular: 'trending', latest: 'recently_updated' };
  url.searchParams.append('sort', sortMap[sort]);
  url.searchParams.append('page', `${page}`);
  if (keyword) url.searchParams.append('keyword', keyword);
  const res = await fetch(url.href);

  const doc = parse(await res.text());
  const entries: Entry[] = [];
  const items = doc.querySelectorAll('.ani.items > .item');
  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];
    const title = item.querySelector('a.name')?.textContent || '';
    const poster = item.querySelector('img')?.getAttribute('src') || '';
    let id = item.querySelector('.ani.poster')?.getAttribute('data-tip') || '';
    id = id.slice(0, id?.indexOf('?'));

    entries.push({ id, title, poster });
  }

  return entries;
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
    const epTitle = a.querySelector('.d-title')?.textContent || '';
    const infoString = a.parentElement?.getAttribute('title') || '';
    const releaseDate = infoString.split(' ', 3).at(2) || '';
    const types: string[] = [];
    const isFiller = infoString.includes('Filler');
    ['Sub', 'Softsub', 'Dub'].forEach((type) => {
      if (infoString.includes(type)) types.push(type);
    });

    if (isFiller) info.push('FILLER');
    info.push(releaseDate);
    info.push(types.join(','));

    episodes.push({ title: `E${i + 1}. ${epTitle}`, info, id });
  });

  return episodes;
}

export async function getEntry(entry: Entry) {
  const details = {};
  const episodes = await getEpisodes(entry.id);

  return { details, episodes };
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

  return { ...sourcesAndTracks, skips };
}
