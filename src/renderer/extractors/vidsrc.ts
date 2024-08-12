import { Buffer } from 'buffer';
import rc4Encrypt from '../utils/rc4Encrypt';
import { Source, Track } from '../types';

async function encodeID(key: string, vidId: string) {
  const rc4 = rc4Encrypt(key, Buffer.from(vidId));

  return rc4.toString('base64').replace(/\//g, '_').replace(/\+/g, '-').trim();
}

async function getSources(url: string): Promise<Source[]> {
  const res = await fetch(url);
  const lines = (await res.text()).split('\n');
  const sources: Source[] = [];

  for (let i = 1; i < lines.length - 1; i += 2) {
    const file = url.slice(0, url.lastIndexOf('/') + 1) + lines[i + 1];
    const qual = Number(
      lines[i].slice(lines[i].lastIndexOf('x') + 1, lines[i].length),
    );

    sources.push({ file, qual });
  }

  return sources;
}
function vrfDecrypt(input: string) {
  const rc4 = rc4Encrypt('9jXDYBZUcTcTZveM', Buffer.from(input, 'base64'));
  return decodeURIComponent(new TextDecoder('utf-8').decode(rc4));
}
export default async function extractor(embedUrl: string) {
  const { hostname } = new URL(embedUrl);
  const id = embedUrl.slice(
    embedUrl.lastIndexOf('/') + 1,
    embedUrl.indexOf('?'),
  );
  const apiSlug = await encodeID('8Qy3mlM2kod80XIK', id);
  const h = await encodeID('BgKVSrzpH2Enosgm', id);
  const urlParams = embedUrl.slice(embedUrl.indexOf('?') + 1, embedUrl.length);
  const url = `https://${hostname}/mediainfo/${apiSlug}?${urlParams}&h=${h}`;
  const res = await fetch(url, { referrer: `https://${hostname}` });
  const { result } = await res.json();
  const decrypted = JSON.parse(vrfDecrypt(result));
  const sources = await getSources(decrypted.sources[0].file);
  const tracks = (decrypted.tracks as Track[]).filter((t) => t.label);

  return { sources, tracks: tracks.length ? tracks : undefined };
}
