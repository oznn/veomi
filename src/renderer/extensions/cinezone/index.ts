import { Details, Episode, Result, Server, Video } from '../../types';
import { decrypt, encrypt } from '../../utils/vrf';
import vidplay from '../../extractors/vidplay';
import filemoon from '../../extractors/filemoon';

const baseURL = 'https://cinezone.to';
const ext = 'cinezone';
const parser = new DOMParser();
const parse = (html: string) => parser.parseFromString(html, 'text/html');
const { electron } = window;
const serverIds: { [key: string]: string } = {
  '41': 'Vidplay',
  '28': 'Mycloud',
  '45': 'Filemoon',
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
  const items = doc.querySelectorAll('.item');

  items.forEach((item) => {
    const a = item.querySelector('a.title');
    const path = a?.getAttribute('href') || '';
    const title = a?.textContent || '';
    const posterURL = item.querySelector('img')?.getAttribute('data-src') || '';
    const dataId =
      item.querySelector('.tooltipBtn')?.getAttribute('data-tip') || '';

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
export async function getDetails(result: Result): Promise<Details | undefined> {
  const res = await fetch(`${baseURL}/ajax/film/tooltip/${result.dataId}`);
  const doc = parse(await res.text());
  const description = doc.querySelector('.description')?.innerHTML || '';
  const meta = doc.querySelector('.meta')?.innerHTML || '';
  const [year] = /(\d{4})/.exec(meta) || [''];
  const [score] = /\d\.\d/.exec(meta) || [''];
  const type = result.path.includes('/tv/') ? 'Series' : 'Movie';

  return { info: [year, type, score], description };
}
export async function getEpisodes(result: Result): Promise<Episode[]> {
  const { dataId } = result;
  const target = await getTarget(ext);
  const vrf = encrypt(target, result.dataId);
  const reqUrl = `${baseURL}/ajax/episode/list/${dataId}?vrf=${vrf}`;
  const res = await fetch(reqUrl);
  const data = await res.json();
  const doc = parse(data.result);

  const episodes: Episode[] = [];
  doc.querySelectorAll('ul.episodes').forEach((ul, i) => {
    ul.querySelectorAll('a').forEach((a, j) => {
      const id = a.getAttribute('data-id') || '';
      const epTitle = a.querySelector('span')?.textContent || '';
      const isNoEpTitle = /[Episode]\s\d/.test(epTitle);
      const title = isNoEpTitle
        ? `S${i + 1} Episode ${j + 1}`
        : `S${i + 1} E${j + 1}. ${epTitle}`;

      episodes.push({
        id,
        title: result.path.includes('/tv/') ? title : 'Movie',
        isSeen: false,
        progress: 0,
        download: {
          isPending: false,
          isCompleted: false,
          progress: 0,
        },
      });
    });
  });

  return episodes;
}
export async function getServers(episodeId: string): Promise<Server[]> {
  const target = await getTarget(ext);
  const vrf = encrypt(target, episodeId);
  const reqUrl = `${baseURL}/ajax/server/list/${episodeId}?vrf=${vrf}`;
  const res = await fetch(reqUrl);
  const { result } = await res.json();
  const doc = parse(result);
  const servers: Server[] = [];

  doc.querySelectorAll('.server').forEach((e) => {
    const id = e.getAttribute('data-link-id') || '';
    const dataId = e.getAttribute('data-id') || '';

    if (Object.keys(serverIds).includes(dataId))
      servers.push({
        name: `[softsub] ${serverIds[dataId]}`,
        id,
        episodeId,
        dataId,
      });
  });

  return servers;
}

export async function getVideo(server: Server): Promise<Video> {
  const vrf = encrypt(targets[ext], server.id);
  const reqUrl = `${baseURL}/ajax/server/${server.id}?vrf=${vrf}`;
  const res = await fetch(reqUrl);
  const { result } = await res.json();
  const embedURL = decrypt(targets[ext], result.url);
  const skips = result.skip_data;
  const origin = `https://${new URL(embedURL).hostname}`;
  const subsURL = `${baseURL}/ajax/episode/subtitles/${server.episodeId}`;
  const tracks = await (await fetch(subsURL)).json();

  electron.ipcRenderer.sendMessage('change-origin', origin);

  // switch (server.name.split(' ')[1]) {
  switch (server.dataId) {
    case '41':
    case '28': {
      const { sources } = await vidplay(embedURL, targets.vidplay);
      return { sources, tracks, skips };
    }
    case '45': {
      const { sources } = await filemoon(embedURL);
      return { sources, tracks, skips };
    }
    default:
      throw Error('Unsupported server');
  }
}
