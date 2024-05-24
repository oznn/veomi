export default async function extractor(embedUrl: string) {
  const { hostname } = new URL(embedUrl);
  const res = await fetch(embedUrl, { referrer: `https://${hostname}` });
  const txt = await res.text();
  const pos = txt.indexOf('src:') + 6;
  const file = txt.slice(pos, txt.indexOf('"', pos));
  const arr = /\WHEIGHT=(\d+)/.exec(txt);
  const qual = arr ? `${arr[1]}p` : 'Unknown quality';

  return { sources: [{ file, qual }], tracks: [] };
}
