export default async function extractor(embedUrl: string) {
  const res = await fetch(embedUrl);
  const txt = await res.text();
  const pos = txt.indexOf('src:') + 6;
  const file = txt.slice(pos, txt.indexOf('"', pos));
  const arr = /\WHEIGHT=(\d+)/.exec(txt);
  const qual = arr ? Number(arr[1]) : 0;

  return { sources: [{ file, qual }] };
}
