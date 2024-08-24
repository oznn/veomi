import { encrypt, decrypt } from '../../utils/vrf';
import vidplay from '../../extractors/vidplay';
import filemoon from '../../extractors/filemoon';
import mp4upload from '../../extractors/mp4upload';
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
const serverIds: { [key: string]: string } = {
  '41': 'Vidplay',
  '28': 'Mycloud',
  '44': 'Filemoon',
  '35': 'Mp4upload',
};

let targets: { [key: string]: any[] } = {};
async function getTarget(t: string) {
  if (Object.keys(targets).length) return targets[t];
  const targetsURL = 'https://rowdy-avocado.github.io/multi-keys/';
  targets = await (await fetch(targetsURL)).json();
  return targets[t];
}

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
  const target = await getTarget(ext);
  const vrf = encrypt(target, dataId);
  const reqUrl = `${baseURL}/ajax/episode/list/${dataId}?vrf=${vrf}`;
  const res = await fetch(reqUrl);
  const data = await res.json();
  const doc = parse(data.result);

  const episodes: Episode[] = [];
  doc.querySelectorAll('a').forEach((a, i) => {
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
    const isValidEp = /^\d+$/.test(a.getAttribute('data-slug') || '');

    if (isValidEp)
      episodes.push({
        id,
        title: isNoEpTitle ? `Episode ${i + 1}` : `${i + 1}. ${epTitle}`,
        isFiller,
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

export async function getServers(episodeId: string): Promise<Server[]> {
  const target = await getTarget(ext);
  const vrf = encrypt(target, episodeId);
  const reqUrl = `${baseURL}/ajax/server/list/${episodeId}?vrf=${vrf}`;
  const res = await fetch(reqUrl);
  const html = (await res.json()).result;
  const doc = parse(html);
  const servers: Server[] = [];

  doc.querySelectorAll('.type').forEach((server) => {
    const type = server.getAttribute('data-type');
    server.querySelectorAll('li').forEach((li) => {
      const id = li.getAttribute('data-link-id') || '';
      const dataId = li.getAttribute('data-sv-id') || '';
      if (Object.keys(serverIds).includes(dataId))
        servers.push({ name: `[${type}] ${serverIds[dataId]}`, id, dataId });
    });
  });

  return servers;
}

export async function getVideo(server: Server): Promise<Video> {
  const target = await getTarget(ext);
  const vrf = encrypt(target, server.id);
  const reqUrl = `${baseURL}/ajax/server/${server.id}?vrf=${vrf}`;
  const res = await fetch(reqUrl);
  const { result } = await res.json();
  const embedURL = decrypt(targets[ext], result.url);
  const skips = decrypt(targets[ext], result.skip_data);
  const origin = `https://${new URL(embedURL).hostname}`;

  electron.ipcRenderer.sendMessage('change-origin', origin);

  switch (server.dataId) {
    case '41':
    case '28': {
      const { sources, tracks } = await vidplay(embedURL, targets.vidplay);
      return { sources, tracks, skips: JSON.parse(skips) as Skips };
    }
    case '44': {
      const { sources } = await filemoon(embedURL);
      return { sources, skips: JSON.parse(skips) as Skips };
    }
    case '35': {
      const { sources } = await mp4upload(embedURL);
      return { sources, skips: JSON.parse(skips) as Skips };
    }
    default:
      throw Error('Unsupported server');
  }
}
