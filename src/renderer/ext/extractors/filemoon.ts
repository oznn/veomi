import { unpack } from 'unpacker';
import { Source } from '../types';

const parser = new DOMParser();
const parse = (html: string) => parser.parseFromString(html, 'text/html');

async function getSources(url: string): Promise<Source[]> {
  const res = await fetch(url);
  const lines = (await res.text()).split('\n');
  const sources: Source[] = [];
  const file = lines[2];
  const [qual] = /\d+x\d+/.exec(lines[1]) || [];

  if (qual) sources.push({ file, qual: Number(qual.split('x')[1]) });

  return sources;
}

export default async function extractor(url: string) {
  const html = await (await fetch(url)).text();
  const script = [...parse(html).querySelectorAll('script')].pop();
  const unpacked = unpack(script?.innerHTML || '');
  const [, master] = /{file:"(.*?)"/.exec(unpacked) || [];
  const sources = await getSources(master);

  return { sources };
}
