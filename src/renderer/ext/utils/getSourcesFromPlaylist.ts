import { Source } from '@types';
import { parse } from 'hls-parser';
import { MasterPlaylist } from 'hls-parser/types';

export default async function f(url: string): Promise<Source[]> {
  console.log('playlistURL', url);
  const res = await fetch(url);
  const playlist = parse(await res.text());

  if (!playlist.isMasterPlaylist) return [{ file: url, qual: 1080 }];
  return (playlist as MasterPlaylist).variants
    .filter((t) => !t.isIFrameOnly)
    .map(({ uri, resolution }) => ({
      file: uri.includes('://')
        ? uri
        : url.slice(0, url.lastIndexOf('/') + 1) + uri,
      qual: resolution?.height || 0,
    }))
    .toSorted((a, b) => b.qual - a.qual);
}
