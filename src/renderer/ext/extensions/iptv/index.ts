import { Result } from '@types';
import { parse } from 'hls-parser';
import { MasterPlaylist } from 'hls-parser/types';

const baseURL = 'https://iptv-org.github.io/api';
const ext = 'iptv';
let channels: any | null = null;
let streams: any | null = null;

export async function getResults(q: string): Promise<Result[]> {
  if (!channels)
    channels = await (await fetch(`${baseURL}/channels.json`)).json();
  if (!streams) streams = await (await fetch(`${baseURL}/streams.json`)).json();

  if (channels && streams)
    return channels
      .filter(
        (c: any) =>
          (c.name + c.id).toLowerCase().includes(q.toLowerCase()) &&
          streams.find((s: any) => s.channel === c.id),
      )
      .map((c: any) => ({
        title: `${c.name} (${c.id})`,
        posterURL: c.logo,
        ext,
        type: 'LIVE',
        path: c.replaced_by || c.id,
      }));
  return [];
}

export async function getStream(channel: string) {
  const url = streams.find((s: any) => s.channel === channel)?.url;
  console.log('channel', channel);
  console.log('url', url);
  if (!url) return undefined;
  try {
    const playlist = parse(await (await fetch(url)).text());

    return (playlist as MasterPlaylist).variants
      .map(({ uri, resolution }) => ({
        file: uri.includes('://')
          ? uri
          : url.slice(0, url.lastIndexOf('/') + 1) + uri,
        qual: resolution?.height || 0,
      }))
      .toSorted((a, b) => b.qual - a.qual);
  } catch (e) {
    return null;
  }
}
