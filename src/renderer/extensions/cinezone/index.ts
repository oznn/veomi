import { Details, Episode, Result, Server, Video } from '../../types';
import { decrypt, encrypt } from '../../utils/vrf';
import vidsrc from '../../extractors/vidsrc';
import filemoon from '../../extractors/filemoon';

const baseURL = 'https://cinezone.to';
const ext = 'cinezone';
const parser = new DOMParser();
const parse = (html: string) => parser.parseFromString(html, 'text/html');
const { electron } = window;

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
  return undefined;
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
  const supportedServers = ['VidCloud', 'MegaCloud', 'FMCloud'];
  const servers: Server[] = [];

  doc.querySelectorAll('.server').forEach((e) => {
    const id = e.getAttribute('data-link-id') || '';
    const serverName = e.querySelector('span')?.textContent || '';
    if (supportedServers.includes(serverName))
      servers.push({
        name: `[softsub] ${serverName}`,
        id,
        episodeId,
      });
  });

  return servers;
}

export async function getVideo(server: Server): Promise<Video> {
  const target = await getTarget(ext);
  const vidplay = await getTarget('vidplay');
  const vrf = encrypt(target, server.id);
  const reqUrl = `${baseURL}/ajax/server/${server.id}?vrf=${vrf}`;
  const res = await fetch(reqUrl);
  const { result } = await res.json();
  const embedURL = decrypt(target, result.url);
  const skips = result.skip_data;
  const origin = `https://${new URL(embedURL).hostname}`;
  const subsURL = `${baseURL}/ajax/episode/subtitles/${server.episodeId}`;
  const tracks = await (await fetch(subsURL)).json();

  electron.ipcRenderer.sendMessage('change-origin', origin);

  switch (server.name.split(' ')[1]) {
    case 'VidCloud':
    case 'MegaCloud': {
      const { sources } = await vidsrc(embedURL, vidplay);
      return { sources, tracks, skips };
    }
    case 'FMCloud': {
      const { sources } = await filemoon(embedURL);
      return { sources, tracks, skips };
    }
    default:
      throw Error('Unsupported server');
  }
}
