import { Chapter, Result } from '@types';

const ext = 'mangadex';
const baseURL = 'https://api.mangadex.org';

export async function getResults(title: string): Promise<Result[]> {
  const results: Result[] = [];
  const res = await fetch(
    `${baseURL}/manga?title=${title}&includes[]=cover_art&limit=20&availableTranslatedLanguage[]=en&order[relevance]=desc`,
  );
  const { data } = await res.json();
  data.forEach((manga: any) => {
    const i = manga.relationships.findIndex((e: any) => e.type === 'cover_art');
    const coverFileName = manga.relationships[i].attributes.fileName;

    results.push({
      title: manga.attributes.title.en,
      path: manga.id,
      posterURL: `https://mangadex.org/covers/${manga.id}/${coverFileName}.256.jpg`,
      type: 'IMAGE',
      ext,
    });
  });

  return results;
}

export async function getDetails() {
  return undefined;
}
export async function getMedia(result: Result): Promise<Chapter[]> {
  const res = await fetch(
    `${baseURL}/manga/${result.path}/feed?limit=500&translatedLanguage[]=en&order[chapter]=asc&includeEmptyPages=0`,
  );
  const { data } = await res.json();
  // const scanaltionGroupIds = data.map((c: any) => c.relationships[0].id);
  // const scanaltionGroupId = scanaltionGroupIds.reduce(
  //   (a: string, b: string, _: number, arr: string[]) =>
  //     arr.filter((v) => v === a).length >= arr.filter((v) => v === b).length
  //       ? a
  //       : b,
  //   '',
  // );

  const chapters: Chapter[] = data
    // .filter((c: any) => c.relationships[0].id === scanaltionGroupId)
    .map((e: any) => ({
      id: e.id,
      title: `${e.attributes.chapter || '0'}. ${
        e.attributes.title || 'Chapter'
      }`,
      currentPage: 0,
      isSeen: false,
    }));

  return chapters;
}

export async function getPages(chapterId: string): Promise<string[]> {
  const res = await fetch(`${baseURL}/at-home/server/${chapterId}`);
  const { baseUrl, chapter } = await res.json();

  return chapter.data.map(
    (img: string) => `${baseUrl}/data/${chapter.hash}/${img}`,
  );
}
