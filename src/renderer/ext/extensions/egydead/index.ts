import { Result, Episode, Server, Video } from '@types';
import { parse } from 'hls-parser';
import { MasterPlaylist } from 'hls-parser/types';
import { unpack } from 'unpacker';

const baseURL = 'https://egydead.center';
const ext = 'egydead';

const parser = new DOMParser();
const parseHTML = (html: string) => parser.parseFromString(html, 'text/html');

export async function getResults(q: string): Promise<Result[]> {
  const res = await fetch(`${baseURL}/?s=${q}`);
  const doc = parseHTML(await res.text());
  const results: Result[] = [];

  doc.querySelectorAll('.movieItem>a').forEach((e) => {
    const path = e.getAttribute('href') || '';
    const title = e.getAttribute('title') || '';
    const posterURL = e.querySelector('img')?.getAttribute('src') || '';

    if (!path.includes('/episode') && !path.includes('/serie'))
      results.push({ title, posterURL, path, ext, type: 'VIDEO' });
  });

  return results;
}

export async function getMedia(result: Result): Promise<Episode[]> {
  const episodes: Episode[] = [];
  const res = await fetch(result.path);
  const doc = parseHTML(await res.text());

  if (result.path.includes('/season')) {
    [...doc.querySelectorAll('.EpsList li>a')].toReversed().forEach((e, i) => {
      const id = e.getAttribute('href') || '';

      episodes.push({
        title: `${i + 1}. Episode`,
        id,
        currentTime: 0,
        isSeen: false,
      });
    });
  } else {
    return [{ title: 'Movie', id: result.path, currentTime: 0, isSeen: false }];
  }

  return episodes;
}

export async function getServers(episodeId: string): Promise<Server[]> {
  const servers: Server[] = [];
  const res = await fetch(episodeId, {
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'View=1',
  });
  const doc = parseHTML(await res.text());
  doc.querySelectorAll('.serversList li').forEach((e) => {
    const name = e.querySelector('span>p')?.textContent || '';
    const id = e.getAttribute('data-link') || '';

    if (name !== 'mixdrop') servers.push({ name, id });
  });

  return servers;
}

export async function getVideo(server: Server): Promise<Video | undefined> {
  if (server.name === 'doodstream') {
    const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const embedUrl = server.id.replace('/d/', '/e/');
    const res = await fetch(embedUrl);
    const base = new URL(res.url).origin;
    const html = await res.text();
    const md5Match = html.match(/\/pass_md5\/[^']*/);

    if (!md5Match) return undefined;

    const md5 = base + md5Match[0];
    const host = await (await fetch(md5)).text();
    const hash = [...Array(10)]
      .map(() => alphabet[Math.floor(Math.random() * alphabet.length)])
      .join('');
    const file = `${host}${hash}?token=${md5.split('/').pop()}`;
    return { sources: [{ file, qual: 1080 }] };
  }
  if (server.id.includes('.sbs/e/')) {
    const html = await (await fetch(server.id)).text();
    const scripts = parseHTML(html).querySelectorAll('script');
    let script =
      [...scripts].find((s) => s.innerHTML.includes('m3u8'))?.innerHTML || '';
    if (script.includes('(p,a,c,k,e,d)')) script = unpack(script);
    const [, master] = /{file:"(.*?)"/.exec(script) || ['', ''];
    const playlist = parse(await (await fetch(master)).text());
    const sources = (playlist as MasterPlaylist).variants
      .filter((t) => !t.isIFrameOnly)
      .map(({ uri, resolution }) => ({
        file: uri.includes('://')
          ? uri
          : master.slice(0, master.lastIndexOf('/') + 1) + uri,
        qual: resolution?.height || 0,
      }))
      .toSorted((a, b) => b.qual - a.qual);

    return { sources };
  }
}
