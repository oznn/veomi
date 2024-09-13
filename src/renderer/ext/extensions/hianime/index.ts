import { Episode, Result, Server, Source, Video, Details } from '@types';
import { anilist } from '../../utils/details';

const baseURL = 'https://hianime.to';
const parser = new DOMParser();
const parse = (html: string) => parser.parseFromString(html, 'text/html');
const ext = 'hianime';
const { electron } = window;

export async function getResults(query: string) {
  const res = await fetch(`${baseURL}/search?keyword=${query}`);
  const doc = parse(await res.text());
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
      ext,
    });
  });
  return results;
}
export async function getEpisodes(result: Result) {
  const { path } = result;
  const entryId = path.slice(path.lastIndexOf('-') + 1, path.length);
  const res = await fetch(`${baseURL}/ajax/v2/episode/list/${entryId}`);
  const doc = parse((await res.json()).html);
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
      title: isNoTitle ? `Episode ${number}` : `${number}. ${title}`,
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
  const doc = parse(await res.text());
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
  const doc = parse(html);
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
async function getSources(url: string): Promise<Source[]> {
  const res = await fetch(url);
  const lines = (await res.text()).split('\n');
  const sources: Source[] = [];

  let i = 1;
  while (lines[i] && lines[i + 1]) {
    const file = url.slice(0, url.lastIndexOf('/') + 1) + lines[i + 1];
    const [qual] = /\d+x\d+/.exec(lines[i]) || [];

    if (qual) sources.push({ file, qual: Number(qual.split('x')[1]) });
    i += 2;
  }
  return sources;
}
export async function getVideo(server: Server): Promise<Video> {
  const res = await fetch(`${baseURL}/ajax/v2/episode/sources?id=${server.id}`);
  const { link } = await res.json();
  const id = link.slice(link.lastIndexOf('/') + 1, link.indexOf('?'));
  const sourceURL = 'https://megacloud.tv/embed-2/ajax/e-1/getsources?id=';
  const data = await (await fetch(sourceURL + id)).json();
  const { tracks, intro, outro } = data;
  const file = data.encrypted
    ? JSON.parse(await electron.extractor.megacloud(data.sources))[0].file
    : data.sources[0].file;
  const sources = await getSources(file);

  console.log({
    sources,
    tracks,
    skips: { intro: [intro.start, intro.end], outro: [outro.start, outro.end] },
  });
  return {
    sources,
    tracks,
    skips: { intro: [intro.start, intro.end], outro: [outro.start, outro.end] },
  };
}
