import { vrfEncrypt, vrfDecrypt } from './utils';
import vidsrcExtractor from '../../extractors/vidsrc';
import mp4uploadExtractor from '../../extractors/mp4upload';
import { Result, Entry, Episode, Server } from '../../types';

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

  items.forEach((item) => {
    const path = item.querySelector('a.name')?.getAttribute('href') || '';
    const title = item.querySelector('a.name')?.textContent || '';
    const posterURL = item.querySelector('img')?.getAttribute('src') || '';

    results.push({
      title,
      posterURL,
      path,
      ext,
      key: `aniwave${path}`.replace(/\./g, ' '),
    });
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
  doc.querySelectorAll('a').forEach((a) => {
    const info: string[] = [];
    const id = a.getAttribute('data-ids') || '';
    const infoString = a.parentElement?.getAttribute('title') || '';
    const epTitle = a.querySelector('.d-title')?.textContent || '';
    const isNoEpTitle = /[Episode]\s\d/.test(epTitle);
    const [releaseDate] = /\d{4}\/\d{2}\/\d{2}/.exec(infoString) || [''];
    const types: string[] = [];
    const isFiller = infoString.includes('Filler');
    ['Sub', 'Softsub', 'Dub'].forEach((type) => {
      if (infoString.includes(type)) types.push(type);
    });
    const epNum = a.getAttribute('data-num');

    if (isFiller) info.push('Filler');
    info.push(releaseDate);
    info.push(types.join(','));

    episodes.push({
      title: isNoEpTitle ? `Episode ${epNum}` : `E${epNum}. ${epTitle}`,
      info,
      isSeen: false,
      progress: 0,
      id,
    });
  });

  return episodes;
}

async function getDetails(path: string) {
  const res = await fetch(baseURL + path);
  const doc = parse(await res.text());
  const meta = doc.querySelectorAll('.bmeta > .meta > div');
  let isCompleted = false;

  meta.forEach((div) => {
    if (div.textContent?.includes('Status'))
      isCompleted = div.querySelector('span')?.textContent === 'Completed';
  });
  const dataId =
    doc.querySelector('#watch-main')?.getAttribute('data-id') || '';
  const title = doc.querySelector('.title.d-title')?.textContent || '';
  const posterURL = doc.querySelector('#w-info img')?.getAttribute('src') || '';

  return { title, posterURL, isCompleted, dataId };
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
    ext: 'aniwave',
    key: `aniwave${path}`.replace(/\./g, ' '),
    preferredSubs: '',
    preferredQual: '',
    preferredServ: '',
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
  const supportedServers = ['Mp4upload', 'Vidstream', 'MegaF'];

  doc.querySelectorAll('.type').forEach((server) => {
    const type = server.getAttribute('data-type');
    server.querySelectorAll('li').forEach((li) => {
      const id = li.getAttribute('data-link-id') || '';
      const serverName = li.textContent || '';
      if (supportedServers.includes(serverName))
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
    case 'Vidstream':
    case 'MegaF':
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
