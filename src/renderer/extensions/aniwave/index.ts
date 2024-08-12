import { vrfEncrypt, vrfDecrypt } from './utils';
import vidsrcExtractor from '../../extractors/vidsrc';
import mp4uploadExtractor from '../../extractors/mp4upload';
import { Result, Episode, Server, Details, Video, Skips } from '../../types';
import { anilist } from '../../utils/details';

const baseURL = 'https://aniwave.to';
const ext = 'aniwave';
const parser = new DOMParser();
const parse = (html: string) => parser.parseFromString(html, 'text/html');
const { electron } = window;
const f = (n: number) => Math.floor(n);
const seasonMap = new Map();
const seasons = ['WINTER', 'SPRING', 'SUMMER', 'FALL'];
const months = [
  'Dec',
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
];
for (let i = 0; i < 12; i += 1) seasonMap.set(months[i], seasons[f(i / 3)]);

export async function getResults(query: string): Promise<Result[]> {
  const res = await fetch(`${baseURL}/filter?keyword=${query}`);
  const doc = parse(await res.text());
  const results: Result[] = [];
  const items = doc.querySelectorAll('.ani.items > .item');

  items.forEach((item) => {
    const path = item.querySelector('a.name')?.getAttribute('href') || '';
    const title = item.querySelector('a.name')?.textContent || '';
    const posterURL = item.querySelector('img')?.getAttribute('src') || '';
    const dataId =
      item.querySelector('.ani.poster')?.getAttribute('data-tip') || '';

    results.push({
      title,
      posterURL,
      path,
      ext,
      dataId: dataId.split('?')[0],
    });
  });

  return results;
}

export async function getEpisodes(result: Result): Promise<Episode[]> {
  const { dataId } = result;
  const vrf = vrfEncrypt(result.dataId);
  const reqUrl = `${baseURL}/ajax/episode/list/${dataId}?vrf=${vrf}`;
  const res = await fetch(reqUrl);
  const data = await res.json();
  const doc = parse(data.result);

  const episodes: Episode[] = [];
  doc.querySelectorAll('a').forEach((a) => {
    const id = a.getAttribute('data-ids') || '';
    const infoString = a.parentElement?.getAttribute('title') || '';
    const epTitle = a.querySelector('.d-title')?.textContent || '';
    const isNoEpTitle = /[Episode]\s\d/.test(epTitle) || !epTitle;
    const [releaseDate] = /\d{4}\/\d{2}\/\d{2}/.exec(infoString) || [''];
    const types: string[] = [];
    const isFiller = infoString.includes('Filler');
    ['Sub', 'Softsub', 'Dub'].forEach((type) => {
      if (infoString.includes(type)) types.push(type);
    });
    const number = a.getAttribute('data-num') || '';
    const isValidEp = /^\d+$/.test(a.getAttribute('data-slug') || '');

    if (isValidEp)
      episodes.push({
        id,
        title: isNoEpTitle ? `Episode ${number}` : `${number}. ${epTitle}`,
        isFiller,
        number: Number(number),
        isSeen: false,
        progress: 0,
        download: {
          progress: 0,
          isPending: false,
          isCompleted: false,
        },
        info: [releaseDate, types.join(', ')],
      });
  });

  return episodes;
}

export async function getDetails(result: Result): Promise<Details | undefined> {
  const res = await fetch(`${baseURL}/ajax/anime/tooltip/${result.dataId}`);
  const html = await res.text();
  const regex = /Date aired:<\/span><span>(\w{3}) (\d{2}), (\d{4})/;
  const dateAired = html.match(regex);
  const [, month, , seasonYear] = dateAired || [];
  const variables = {
    search: result.title,
    season: seasonMap.get(month),
    seasonYear,
  };
  const query = `
query ($id: Int, $search: String, $season: MediaSeason, $seasonYear: Int) {
  Media (id: $id, search: $search, season: $season, seasonYear: $seasonYear) {
    id
  }
}
`;
  const url = 'https://graphql.anilist.co';
  const body = JSON.stringify({ query, variables });
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  };
  const { data } = await (await fetch(url, options)).json();

  return data.Media ? anilist(data.Media.id) : undefined;
}

export async function getServers(episode: Episode): Promise<Server[]> {
  const vrf = vrfEncrypt(episode.id);
  const reqUrl = `${baseURL}/ajax/server/list/${episode.id}?vrf=${vrf}`;
  const res = await fetch(reqUrl);
  const html = (await res.json()).result;
  const doc = parse(html);
  const servers: Server[] = [];
  const supportedServers = ['MP4u', 'Vidstream', 'MegaF'];

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

export async function getVideo(server: Server): Promise<Video | undefined> {
  const serverId = server.id || '';
  const serverName = server.name ? server.name.split(' ')[1] : '';
  const vrf = vrfEncrypt(serverId);
  const reqUrl = `${baseURL}/ajax/server/${serverId}?vrf=${vrf}`;
  const res = await fetch(reqUrl, { referrer: baseURL });
  const { result } = await res.json();
  const embedUrl = vrfDecrypt(result.url);
  const skips = vrfDecrypt(result.skip_data);
  const origin = `https://${new URL(embedUrl).hostname}`;

  electron.ipcRenderer.sendMessage('change-origin', origin);

  switch (serverName) {
    case 'Vidstream':
    case 'MegaF': {
      const { sources, tracks } = await vidsrcExtractor(embedUrl);
      return { sources, tracks, skips: JSON.parse(skips) as Skips };
    }
    case 'MP4u': {
      const sources = await mp4uploadExtractor(embedUrl);
      return { sources, skips: JSON.parse(skips) as Skips };
    }
    default:
      return undefined;
  }
}
