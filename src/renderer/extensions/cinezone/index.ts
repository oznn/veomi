import { Details, Episode, Result, Server, Video } from '../../types';
import { vrfDecrypt, vrfEncrypt } from './utils';
import vidsrcExtractor from '../../extractors/vidsrc';

const baseURL = 'https://cinezone.to';
const ext = 'cinezone';
const parser = new DOMParser();
const parse = (html: string) => parser.parseFromString(html, 'text/html');
const { electron } = window;

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
  const vrf = vrfEncrypt(result.dataId);
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
  const vrf = vrfEncrypt(episodeId);
  const reqUrl = `${baseURL}/ajax/server/list/${episodeId}?vrf=${vrf}`;
  const res = await fetch(reqUrl);
  const { result } = await res.json();
  const doc = parse(result);
  const supportedServers = ['VidCloud', 'MegaCloud'];
  const servers: Server[] = [];

  doc.querySelectorAll('.server').forEach((e) => {
    const id = e.getAttribute('data-link-id') || '';
    const serverName = e.querySelector('span')?.textContent || '';
    if (supportedServers)
      servers.push({
        name: `[softsub] ${serverName}`,
        id,
        episodeId,
      });
  });

  return servers;
}
export async function getVideo(server: Server): Promise<Video> {
  const vrf = vrfEncrypt(server.id);
  const reqUrl = `${baseURL}/ajax/server/${server.id}?vrf=${vrf}`;
  const res = await fetch(reqUrl);
  const { result } = await res.json();
  const embedUrl = vrfDecrypt(result.url);
  const skips = result.skip_data;
  const origin = `https://${new URL(embedUrl).hostname}`;

  electron.ipcRenderer.sendMessage('change-origin', origin);

  switch (server.name.split(' ')[1]) {
    case 'VidCloud':
    case 'MegaCloud': {
      const { sources } = await vidsrcExtractor(embedUrl);
      const subsURL = `${baseURL}/ajax/episode/subtitles/${server.episodeId}`;
      const tracks = await (await fetch(subsURL)).json();
      return { sources, tracks, skips };
    }
    default:
      throw Error('Unsupported server');
  }
}
