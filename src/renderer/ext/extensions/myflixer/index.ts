import { Episode, Result, Server, Video } from '@types';

const baseURL = 'https://myflixerz.to';
const ext = 'myflixer';
const parser = new DOMParser();
const parse = (html: string) => parser.parseFromString(html, 'text/html');

export async function getResults(q: string): Promise<Result[]> {
  const url = `https://myflixerz.to/search/${q.replaceAll(' ', '-')}`;
  const html = await (await fetch(url)).text();
  const doc = parse(html);
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
  const seasonsDoc = parse(seasonsHTML);
  const seasons = seasonsDoc.querySelectorAll('a.ss-item');

  for (let i = 0; i < seasons.length; i += 1) {
    const seasonId = seasons[i].getAttribute('data-id');
    /* eslint-disable no-await-in-loop */
    const episodesHTML = await (
      await fetch(`${baseURL}/ajax/season/episodes/${seasonId}`)
    ).text();
    const episodesDoc = parse(episodesHTML);
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
  const doc = parse(html);
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

  console.log(link);
}
