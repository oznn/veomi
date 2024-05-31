import { Buffer } from 'buffer';
import rc4Encrypt from '../utils/rc4Encrypt';
import { Source, Track } from '../types';

async function encodeID(vidId: string) {
  const reqUrl =
    'https://raw.githubusercontent.com/KillerDogeEmpire/vidplay-keys/keys/keys.json';
  const res = await fetch(reqUrl);
  const keyList = await res.json();
  let rc4 = rc4Encrypt(keyList[0], Buffer.from(vidId));
  rc4 = rc4Encrypt(keyList[1], rc4);
  return rc4.toString('base64').replace(/\//g, '_').trim();
}
async function futoken(v: string, hostname: string) {
  const reqUrl = `https://${hostname}/futoken`;
  const res = await fetch(reqUrl, { referrer: `https://${hostname}` });
  const txt = await res.text();
  const k = txt.slice(txt.indexOf("='") + 2, txt.indexOf("',"));
  const a = [k];
  for (let i = 0; i < v.length; i += 1)
    a.push(`${k.charCodeAt(i % k.length) + v.charCodeAt(i)}`);
  return `mediainfo/${a.join(',')}`;
}

async function getSources(url: string, hostname: string): Promise<Source[]> {
  const res = await fetch(url, { referrer: `https://${hostname}` });
  const lines = (await res.text()).split('\n');
  const sources: { file: string; qual: string }[] = [];

  for (let i = 1; i < lines.length - 1; i += 2) {
    const file = url.slice(0, url.lastIndexOf('/') + 1) + lines[i + 1];
    const qual = `${lines[i].slice(
      lines[i].lastIndexOf('x') + 1,
      lines[i].length,
    )}p`;

    sources.push({ file, qual });
  }
  return sources;
}
export default async function extractor(embedUrl: string) {
  const { hostname } = new URL(embedUrl);
  const id = embedUrl.slice(
    embedUrl.lastIndexOf('/') + 1,
    embedUrl.indexOf('?'),
  );
  const mediainfo = await futoken(await encodeID(id), hostname);
  const urlParams = embedUrl.slice(embedUrl.indexOf('?') + 1, embedUrl.length);
  const url = `https://${hostname}/${mediainfo}?${urlParams}`;
  const res = await fetch(url, { referrer: `https://${hostname}` });
  const { result } = await res.json();
  console.log('vidsrc result', result);
  const sources = await getSources(result.sources[0].file, hostname);
  const tracks = (result.tracks as Track[]).filter((t) => t.label);

  return { sources, tracks };
}
