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
    `${baseURL}/manga/${result.path}/feed?limit=500&translatedLanguage[]=en&order[chapter]=asc&includeEmptyPages=0&includes[]=scanlation_group`,
  );
  const { data } = await res.json();
  const groupedChapters: { name: string; id: string; chapters: Chapter[] }[] =
    [];

  data.forEach((c: any) => {
    const i = groupedChapters.findIndex((e) => e.id === c.relationships[0].id);
    const chapter = {
      id: c.id,
      title: `${c.attributes.chapter || '0'}. ${
        c.attributes.title || 'Chapter'
      }`,
      currentPage: 0,
      isSeen: false,
    };

    if (i === -1)
      groupedChapters.push({
        name: c.relationships[0].attributes?.name || 'No group',
        id: c.relationships[0].id,
        chapters: [chapter],
      });
    else groupedChapters[i].chapters.push(chapter);
  });

  const a = groupedChapters.map((c) => ({
    name: c.name,
    chapters: c.chapters,
  }));

  return a[0].chapters;
}

export async function getPages(chapterId: string): Promise<string[]> {
  const res = await fetch(`${baseURL}/at-home/server/${chapterId}`);
  const { baseUrl, chapter } = await res.json();

  return chapter.data.map(
    (img: string) => `${baseUrl}/data/${chapter.hash}/${img}`,
  );
}
