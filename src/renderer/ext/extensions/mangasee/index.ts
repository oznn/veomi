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

export function getDetails() {
  return undefined;
}
export async function getMedia(result: Result): Promise<Chapter> {
  const res = await fetch(`${baseURL}/manga/${result.path}`);
  const [, dir] = /vm.Chapters = \[(.*)\]/.exec(await res.text()) || ['', ''];
  const chapters = JSON.parse(`[${dir}]`);

  return chapters.map((c: any, i: number) => ({
    id: `${result.path} ${i + 1}`,
    title: `${i + 1}. ${c.ChapterName || 'Chapter'}`,
    isSeen: false,
    currentPage: 0,
  }));
}

export async function getPages(id: string): Promise<string[]> {
  const [name, number] = id.split(' ');
  const url = `${baseURL}/read-online/${name}-chapter-${number}.html`;
  const html = await (await fetch(url)).text();
  const [, host] = /vm.CurPathName = "(.*)"/.exec(html) || ['', ''];
  const [, chap] = /vm.CurChapter = {(.*?)}/.exec(html) || ['', ''];
  const chapter = JSON.parse(`{${chap}}`);
  const dir = chapter.Directory ? `${chapter.Directory}/` : '';
  const pages: string[] = [];

  for (let i = 0; i < Number(chapter.Page); i += 1) {
    const page = `${i + 1}`.padStart(3, '0');
    pages.push(
      `https://${host}/manga/${name}/${dir}${number.padStart(
        4,
        '0',
      )}-${page}.png`,
    );
  }

  return pages;
}
