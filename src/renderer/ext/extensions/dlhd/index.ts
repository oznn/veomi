import { Result } from '@types';
import getSources from '../../utils/getSourcesFromPlaylist';

const { electron } = window;
const ext = 'dlhd';
const baseURL = 'https://dlhd.sx';
const parser = new DOMParser();
const parseHTML = (html: string) => parser.parseFromString(html, 'text/html');

export async function getResults(q: string) {
  const res = await fetch(`${baseURL}/24-7-channels.php`);
  const doc = parseHTML(await res.text());
  const results: Result[] = [];
  doc
    .querySelector('.grid-container')
    ?.querySelectorAll('.grid-item a')
    .forEach((e) => {
      const title = e.querySelector('strong')?.textContent || '';
      const path = e.getAttribute('href') || '';

      results.push({ ext, title, path, type: 'LIVE', posterURL: '' });
    });

  console.log(
    results.filter((r) => r.title.toLowerCase().includes(q.toLowerCase())),
  );
  return results.filter((r) => r.title.toLowerCase().includes(q.toLowerCase()));
}

export async function getStream(path: string) {
  const res = await fetch(baseURL + path);
  const doc = parseHTML(await res.text());
  const iframeSrc = doc.querySelector('#thatframe')?.getAttribute('src') || '';
  const html = await (await fetch(iframeSrc)).text();
  const [playlistURL] = /'(.*)\.m3u8'/.exec(html) || [''];
  const sources = await getSources(playlistURL.slice(1, -1));
  electron.ipcRenderer.sendMessage(
    'change-origin',
    'https://cookiewebplay.xyz',
  );
  electron.ipcRenderer.sendMessage(
    'change-referrer',
    'https://cookiewebplay.xyz/',
  );
  return sources;
  // console.log(await res.text());
}

// "https://xyzdddd.mizhls.ru/lb/premium91/https://ddh1.iosplayer.ru/tshttp/ddh1/premium91/mono.m3u8?token=none"
