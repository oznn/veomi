import { MasterPlaylist } from 'hls-parser/types';
import { Episode, Result, Server, Video } from '@types';
import embedExtractor from '../../extractors/embed';
import { parse } from 'hls-parser';

const baseURL = 'https://myflixerz.to';
const ext = 'myflixer';
const parser = new DOMParser();
const parseHTML = (html: string) => parser.parseFromString(html, 'text/html');
const { electron } = window;

export async function getResults(q: string): Promise<Result[]> {
  const url = `https://myflixerz.to/search/${q.replaceAll(' ', '-')}`;
  const html = await (await fetch(url)).text();
  const doc = parseHTML(html);
  const items = doc.querySelectorAll('.flw-item');
  const results: Result[] = [];

  items.forEach((e) => {
    const title = e.querySelector('.film-name a')?.innerHTML || '';
    const posterURL =
      e.querySelector('.film-poster img')?.getAttribute('data-src') || '';
    const path = e.querySelector('.film-poster a')?.getAttribute('href') || '';

    results.push({ title, posterURL, ext, path, type: 'VIDEO' });
  });

  return results;
}

export function getDetails() {
  return undefined;
}
export async function getMedia(result: Result): Promise<Episode[]> {
  const episodes: Episode[] = [];
  const { path } = result;
  const entryDataId = path.slice(path.lastIndexOf('-') + 1, path.length);

  if (result.path.includes('/movie'))
    return [
      {
        id: `list/${entryDataId}`,
        title: 'Movie',
        currentTime: 0,
        isSeen: false,
      },
    ];

  const seasonsHTML = await (
    await fetch(`${baseURL}/ajax/season/list/${entryDataId}`)
  ).text();
  const seasonsDoc = parseHTML(seasonsHTML);
  const seasons = seasonsDoc.querySelectorAll('a.ss-item');

  for (let i = 0; i < seasons.length; i += 1) {
    const seasonId = seasons[i].getAttribute('data-id');
    /* eslint-disable no-await-in-loop */
    const episodesHTML = await (
      await fetch(`${baseURL}/ajax/season/episodes/${seasonId}`)
    ).text();
    const episodesDoc = parseHTML(episodesHTML);
    episodesDoc.querySelectorAll('a.eps-item').forEach((e) => {
      const episodeDataId = e.getAttribute('data-id') || '';
      const episodeTitle = e.getAttribute('title') || '';
      const [, number, title] = /Eps (\d+): (.+)/.exec(episodeTitle) || [
        '',
        '',
        '',
      ];

      episodes.push({
        id: `servers/${episodeDataId}`,
        title: title
          ? `S${i + 1} E${number}. ${title}`
          : `S${i + 1} Episode ${number}`,
        currentTime: 0,
        isSeen: false,
      });
    });
  }

  return episodes;
}

export async function getServers(dataId: string): Promise<Server[]> {
  const servers: Server[] = [];
  const res = await fetch(`${baseURL}/ajax/episode/${dataId}`);

  const html = await res.text();
  const doc = parseHTML(html);
  doc.querySelectorAll('a').forEach((e) => {
    const name = e.getAttribute('title') || '';
    const id = e.getAttribute('data-id') || e.getAttribute('data-linkid') || '';

    servers.push({ name: `[softsub] ${name.split(' ')[1]}`, id });
  });

  return servers;
}

export async function getVideo(server: Server): Promise<Video | undefined> {
  const res = await fetch(`${baseURL}/ajax/episode/sources/${server.id}`);
  const { link } = await res.json();
  const [url, playlistURL] = (await embedExtractor(link, [
    'getSources',
    '.m3u8',
  ])) as string;
  const headers = {
    custom: JSON.stringify({
      'X-Requested-With': 'XMLHttpRequest',
      Referer: link,
      Origin: 'https://megacloud.tube',
    }),
  };
  const { tracks } = await (await fetch(url, { headers })).json();
  const playlist = parse(await (await fetch(playlistURL)).text());
  const sources = (playlist as MasterPlaylist).variants
    .filter((t) => !t.isIFrameOnly)
    .map(({ uri, resolution }) => ({
      file: uri.includes('://')
        ? uri
        : url.slice(0, url.lastIndexOf('/') + 1) + uri,
      qual: resolution?.height || 0,
    }));

  return { sources, tracks };
}
