import { parse } from 'iptv-playlist-parser';
import defaultM3u from './m3u';

const ext = 'freeiptvgen';
const apiURL = 'https://iptv-umber-zeta.vercel.app/';
let m3u = '';

export async function getResults(q: string) {
  if (!m3u) {
    const res = await fetch(`${apiURL}/get?key=freeiptvgen`);
    const { code } = await res.json();
    console.log('code',code);
    m3u = defaultM3u.replace(/\/\d+\//g, `/${code}/`);
  }
  if (m3u) {
    const { items } = parse(m3u);

    return items
      .filter((item) => item.name.toLowerCase().includes(q.toLowerCase()))
      .map((item) => ({
        ext,
        type: 'LIVE',
        posterURL: item.tvg.logo,
        title: item.name,
        path: item.url,
      }));
  }
}

export async function getStream(url: string) {
  console.log('file', url);
  return [{ file: url, qual: 0 }];
}
