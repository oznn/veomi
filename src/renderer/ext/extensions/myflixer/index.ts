import { Episode, Result, Server, Video } from '@types';
import embedExtractor from '../../extractors/embed';
import getSources from '../../utils/getSourcesFromPlaylist';

const baseURL = 'https://myflixerz.to';
const ext = 'myflixer';
const parser = new DOMParser();
const parseHTML = (html: string) => parser.parseFromString(html, 'text/html');

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
    const n = name.includes('Server') ? 1 : 0;

    servers.push({ name: `[softsub] ${name.split(' ')[n]}`, id });
  });

  return servers;
}

export async function getVideo(server: Server): Promise<Video | undefined> {
  const res = await fetch(`${baseURL}/ajax/episode/sources/${server.id}`);
  const { link } = await res.json();
  const [url, file] = (await embedExtractor(link, [
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

  return { sources: [{ file, qual: 1080 }], tracks };
}
