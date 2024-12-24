import fuzzysort from 'fuzzysort';
import { Episode, Result, Server, Video, Details } from '@types';
import getSources from '../../utils/getSourcesFromPlaylist';
import { anilist } from '../../utils/details';
import embedExtractor from '../../extractors/embed';

const baseURL = 'https://hianime.to';
const parser = new DOMParser();
const parseHTML = (html: string) => parser.parseFromString(html, 'text/html');
const ext = 'hianime';

export async function getResults(q: string) {
  const res = await fetch(`${baseURL}/search?keyword=${q}`);
  const doc = parseHTML(await res.text());
  const elements = doc.querySelectorAll('.flw-item');
  const results: Result[] = [];
  elements.forEach((e) => {
    const title = e.querySelector('.film-detail a')?.innerHTML || '';
    const path = e.querySelector('.film-detail a')?.getAttribute('href') || '';
    const posterURL =
      e.querySelector('.film-poster img')?.getAttribute('data-src') || '';

    results.push({
      title,
      path: path.slice(0, path.indexOf('?')),
      posterURL,
      type: 'VIDEO',
      ext,
    });
  });

  return fuzzysort.go(q, results, { key: 'title' }).map(({ obj }) => obj);
}
export async function getMedia(result: Result) {
  const { path } = result;
  const entryId = path.slice(path.lastIndexOf('-') + 1, path.length);
  const res = await fetch(`${baseURL}/ajax/v2/episode/list/${entryId}`);
  const doc = parseHTML((await res.json()).html);
  const elements = doc.querySelectorAll('.ss-list a');
  const episodes: Episode[] = [];

  elements.forEach((e) => {
    const id = e.getAttribute('data-id') || '';
    const title = e.getAttribute('title') || '';
    const number = e.getAttribute('data-number') || '';
    const className = e.getAttribute('class') || '';
    const isFiller = className.includes('filler');
    const isNoTitle = /[Episode]\s\d/.test(title);

    episodes.push({
      id,
      title: isNoTitle ? `${number}. Episode` : `${number}. ${title}`,
      isSeen: false,
      currentTime: 0,
      isFiller,
    });
  });

  return episodes;
}
export async function getDetails(result: Result): Promise<Details | null> {
  return null;
  const res = await fetch(baseURL + result.path);
  const doc = parseHTML(await res.text());
  const search = doc.querySelector('.film-name')?.innerHTML || '';
  let season = '';
  let seasonYear = '';

  doc.querySelectorAll('.item-title').forEach((e) => {
    if (e.querySelector('.item-head')?.innerHTML.includes('Premiered')) {
      const name = e.querySelector('.name')?.innerHTML || '';
      season = name.split(' ')[0].toUpperCase(); //eslint-disable-line
      seasonYear = name.split(' ')[1]; //eslint-disable-line
    }
  });

  const variables = { search, season, seasonYear };
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

  return data.Media ? anilist(data.Media.id) : null;
}
export async function getServers(episodeId: string) {
  const res = await fetch(
    `${baseURL}/ajax/v2/episode/servers?episodeId=${episodeId}`,
  );
  const { html } = await res.json();
  const doc = parseHTML(html);
  const elements = doc.querySelectorAll('.server-item');
  const servers: Server[] = [];
  const supportedServers = ['HD-1', 'HD-2'];

  elements.forEach((e) => {
    const type = e.getAttribute('data-type') || '';
    const id = e.getAttribute('data-id') || '';
    const name = e.querySelector('a')?.innerHTML || '';

    if (supportedServers.includes(name))
      servers.push({ id, name: `[${type}] ${name}` });
  });

  return servers;
}
export async function getVideo(server: Server): Promise<Video> {
  const res = await fetch(`${baseURL}/ajax/v2/episode/sources?id=${server.id}`);
  const { link } = await res.json();
  console.log('link', link);
  const [apiURL, playlistURL] = (await embedExtractor(link, [
    'getSources?id=',
    '.m3u8',
  ])) as string;
  const data = await (await fetch(apiURL)).json();
  const { tracks, intro, outro } = data;
  const sources = await getSources(playlistURL);

  return {
    sources,
    tracks,
    skips: { intro: [intro.start, intro.end], outro: [outro.start, outro.end] },
  };
}
