import { Episode, Result, Server } from '@types';
import getSources from '../../utils/getSourcesFromPlaylist';

const ext = 'aniwave';
const baseURL = 'https://aniwave.lv';
const parser = new DOMParser();
const parseHTML = (html: string) => parser.parseFromString(html, 'text/html');

export async function getResults(q: string) {
  const res = await fetch(`${baseURL}/filter?keyword=${q}`);
  const doc = parseHTML(await res.text());
  const results: Result[] = [];

  doc.querySelectorAll('#list-items .item').forEach((e) => {
    const title = e.querySelector('.name')?.textContent || '';
    const path = e.querySelector('.name')?.getAttribute('href') || '';
    const posterURL = e.querySelector('img')?.getAttribute('src') || '';
    const id = e.querySelector('.ani')?.getAttribute('data-tip') || '';
    const isDub = /\(Dub\)$/.test(title);

    if (!isDub)
      results.push({ id, title, path, posterURL, ext, type: 'VIDEO' });
  });

  return results;
}

export async function getMedia(result: Result) {
  const headers = { 'x-requested-with': 'XMLHttpRequest' };
  const res = await fetch(`${baseURL}/ajax/episode/list/${result.id}`, {
    headers,
  });
  const episodes: Episode[] = [];
  const doc = parseHTML((await res.json()).result);
  console.log(doc);
  doc.querySelectorAll('.episodes a').forEach((e) => {
    const id = e.getAttribute('data-ids') || '';
    const number = e.getAttribute('data-num') || '';

    episodes.push({
      id,
      title: `${number}. Episode`,
      isSeen: false,
      currentTime: 0,
      isFiller: false,
    });
  });

  console.log(episodes);
  return episodes;
}

export async function getServers(episodeId: string) {
  const headers = { 'x-requested-with': 'XMLHttpRequest' };
  const res = await fetch(`${baseURL}/ajax/server/list?servers=${episodeId}`, {
    headers,
  });
  const doc = parseHTML((await res.json()).result);
  const servers: Server[] = [];
  const sub = doc.querySelectorAll('.type')[0];
  const dub = doc.querySelectorAll('.type')[1];
  console.log(doc);
  sub.querySelectorAll('li').forEach((e) => {
    const serverName = e.textContent || '';
    const name = `[sub] ${serverName.trim()}`;
    const id = e.getAttribute('data-link-id') || '';
    if (name.includes('Vidplay')) servers.push({ name, id });
  });
  if (dub)
    dub.querySelectorAll('li').forEach((e) => {
      const serverName = e.textContent || '';
      const name = `[dub] ${serverName.trim()}`;
      const id = e.getAttribute('data-link-id') || '';
      if (name.includes('Vidplay')) servers.push({ name, id });
    });
  return servers;
}

export async function getVideo(server: Server) {
  const headers = { 'x-requested-with': 'XMLHttpRequest' };
  const res = await fetch(`${baseURL}/ajax/server?get=${server.id}`, {
    headers,
  });
  const { url } = (await res.json()).result;
  const html = await (await fetch(url)).text();
  const [, playlistURL] = /"file": `(.*)`/.exec(html) || ['', ''];
  const sources = await getSources(playlistURL);

  return { sources };
}
