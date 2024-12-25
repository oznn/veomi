import { Chapter, Result } from '@types';

const ext = 'mangasee';
const baseURL = 'https://mangasee123.com';
let vmDir: Record<string, string>[] | null = null;

export async function getResults(q: string): Promise<Result[]> {
  if (!vmDir) {
    const res = await fetch(`${baseURL}/search`);
    const [, dir] = /vm.Directory = \[(.*)\]/.exec(await res.text()) || [
      '',
      '',
    ];
    vmDir = JSON.parse(`[${dir}]`);
  }
  if (vmDir) {
    const filteredVmDir = vmDir.filter((e: any) => {
      const titles = [e.s, ...e.al].map((t) => t.toLowerCase());
      return titles.some((t) => t.includes(q.toLowerCase()));
    });

    return filteredVmDir.map((e) => ({
      title: e.s,
      path: e.i,
      posterURL: `https://temp.compsci88.com/cover/${e.i}.jpg`,
      type: 'IMAGE',
      ext,
    }));
  }
  return [];
}

function formatChapter(s: string) {
  const a = s.slice(1, -1).replace(/^0+/, '');
  const b = s.charAt(s.length - 1);

  if (b === '0' && a.length > 0) return [a, a.padStart(4, '0')];
  if (b === '0' && a.length === 0) return ['0', '0000'];

  return [`${a}.${b}`, `${a.padStart(4, '0')}.${b}`];
}
export async function getMedia(result: Result): Promise<Chapter> {
  const res = await fetch(`${baseURL}/manga/${result.path}`);
  const [, dir] = /vm.Chapters = \[(.*)\]/.exec(await res.text()) || ['', ''];
  const chapters = JSON.parse(`[${dir}]`);

  return chapters
    .map((c: any) => {
      const [num, paddedNum] = formatChapter(c.Chapter);
      return {
        id: `${result.path} ${paddedNum}`,
        title: `${num}. ${c.ChapterName || 'Chapter'}`,
        isSeen: false,
        currentPage: 0,
      };
    })
    .reverse();
}

export async function getPages(id: string): Promise<string[]> {
  const [name, num] = id.split(' ');
  const chapNum = `${name}-chapter-${num.replace(/^0+/, '')}`;
  const url = `${baseURL}/read-online/${chapNum}.html`;
  const html = await (await fetch(url)).text();
  const [, host] = /vm.CurPathName = "(.*)"/.exec(html) || ['', ''];
  const [, chap] = /vm.CurChapter = {(.*?)}/.exec(html) || ['', ''];
  const chapter = JSON.parse(`{${chap}}`);
  const dir = chapter.Directory ? `${chapter.Directory}/` : '';
  const pages: string[] = [];

  for (let i = 0; i < Number(chapter.Page); i += 1) {
    const page = `${i + 1}`.padStart(3, '0');
    pages.push(`https://${host}/manga/${name}/${dir}${num}-${page}.png`);
  }

  return pages;
}
