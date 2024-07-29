import { Entry, Episode, Result, Server, Source, Video } from '../../types';

const baseURL = 'https://hianime.to';
const parser = new DOMParser();
const parse = (html: string) => parser.parseFromString(html, 'text/html');
const ext = 'hianime';

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
export async function getEpisodes(episodeId: string) {
  const res = await fetch(`${baseURL}/ajax/v2/episode/list/${episodeId}`);
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
      title: isNoTitle ? `Episode ${number}` : `E${number}. ${title}`,
      isFiller,
      number,
      isSeen: false,
      progress: 0,
      download: {
        isPending: false,
        isCompleted: false,
        progress: 0,
      },
    });
  });
  return episodes;
}
export async function getDetails(url: string) {
  const res = await fetch(url);
  const doc = parse(await res.text());
  const title = doc.querySelector('.film-name')?.innerHTML || '';
  const desc = doc.querySelector('.film-description .text')?.innerHTML || '';
  const posterURL =
    doc.querySelector('.film-poster img')?.getAttribute('src') || '';
  let isCompleted = false;
  let studio = '';

  doc.querySelectorAll('.item-title').forEach((e) => {
    if (
      e.querySelector('.item-head')?.innerHTML.includes('Status') &&
      e.querySelector('.name')?.innerHTML === 'Finished Airing'
    )
      isCompleted = true;
    if (e.querySelector('.item-head')?.innerHTML.includes('Studios'))
      studio = e.querySelector('.name')?.innerHTML || '';
  });

  return { title, posterURL, isCompleted, studio, desc };
}
export async function getEntry(path: string): Promise<Entry> {
  const details = await getDetails(baseURL + path);
  const episodeId = path.slice(path.lastIndexOf('-') + 1, path.length);
  const episodes = await getEpisodes(episodeId);

  return {
    details: { ...details, id: episodeId },
    episodes,
    isInLibary: false,
    isSkip: { intro: true, outro: true },
    volume: 10,
    ext,
    path,
    key: (ext + path).replace(/\./g, ' '),
    preferredSubs: 'English',
    preferredQual: '',
    preferredServ: '',
  };
}
export async function getServers(episode: Episode) {
  const res = await fetch(
    `${baseURL}/ajax/v2/episode/servers?episodeId=${episode.id}`,
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
      servers.push({ id, name: `[${type}]${name}` });
  });
  return servers;
}
async function getSources(url: string): Promise<Source[]> {
  const res = await fetch(url);
  const lines = (await res.text()).split('\n');
  const sources: { file: string; qual: string }[] = [];

  let i = 1;
  while (lines[i] && lines[i + 1]) {
    const file = url.slice(0, url.lastIndexOf('/') + 1) + lines[i + 1];
    const [qual] = /\d+x\d+/.exec(lines[i]) || [];

    sources.push({ file, qual: qual ? `${qual.split('x')[1]}p` : '' });
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
  const sources = await getSources(data.sources[0].file);

  return {
    sources,
    tracks,
    skips: { intro: [intro.start, intro.end], outro: [outro.start, outro.end] },
  };
}
