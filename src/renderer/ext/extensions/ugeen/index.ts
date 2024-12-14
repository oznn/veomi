import { parse } from 'iptv-playlist-parser';
import m3u from './m3u';

const ext = 'ugeen';
const apiURL = 'https://iptv-umber-zeta.vercel.app/';
let code = 'Ugeen_VIP3sjM0N/gJqQmT';

export async function getResults(q: string) {
  if (!code) {
    const res = await fetch(`${apiURL}/get?key=ugeen`);
    const json = await res.json();

    code = json.code;
  }
  if (code) {
    const { items } = parse(m3u);

    return items
      .map((item) => ({
        ext,
        type: 'LIVE',
        posterURL: item.tvg.logo,
        title: item.name.replace('IpTV4ON', 'beIN'),
        path: item.url.replace('Ugeen_RtsJSR/WWao37', code),
      }))
      .filter((item) => item.title.toLowerCase().includes(q.toLowerCase()));
  }
}

export async function getStream(url: string) {
  console.log('file', url);
  return [{ file: url, qual: 0 }];
}
