import { Episode, Result } from '@types';
import fuzzysort from 'fuzzysort';

const ext = 'wecima';
const baseURL = 'https://wecima.movie';
const parser = new DOMParser();
const parseHTML = (html: string) => parser.parseFromString(html, 'text/html');

export async function getResults(q: string) {
  const results: Result[] = [];
  const url = `${baseURL}/search/${q}`;
  const res1 = await fetch(url);
  const output1 = await res1.text();
  const doc1 = parseHTML(output1);
  const tabs = doc1.querySelector('.list--Tabsui')?.innerHTML || '';
  const doc2 = tabs.includes('list/series')
    ? parseHTML(await (await fetch(`${url}/list/series`)).text())
    : null;
  const doc3 = tabs.includes('list/series')
    ? parseHTML(await (await fetch(`${url}/list/anime`)).text())
    : null;

  [doc1, doc2, doc3].forEach((doc) => {
    if (doc)
      doc.querySelectorAll('.Thumb--GridItem a').forEach((e) => {
        const path = e.getAttribute('href') || '';
        const title = e.getAttribute('title') || '';
        const a =
          e.querySelector('span')?.getAttribute('data-lazy-style') || '';
        const [posterURL] = /\(.*\)/.exec(a) || [''];

        results.push({
          ext,
          type: 'VIDEO',
          path,
          title,
          posterURL: posterURL.slice(1, -1),
        });
      });
  });

  return fuzzysort.go(q, results, { key: 'title' }).map(({ obj }) => obj);
}

export async function getMedia(result: Result): Promise<Episode[]> {
  if (result.path.includes('/watch/'))
    return [{ id: result.path, title: 'Movie', isSeen: false, currentTime: 0 }];
  const html = await (await fetch(result.path)).text();
  const episodes: Episode[] = [];
  const dubEpisodes: Episode[] = [];
  const doc = parseHTML(html);
  const epSelector = '.Episodes--Seasons--Episodes episodetitle';
  const epTitle = doc.querySelector(epSelector)?.textContent || '';
  const epNum = /\d+/.exec(epTitle);
  // console.log(a);
  // doc.querySelectorAll('.List--Seasons--Episodes').forEach((e, i) => {
  //   if (!i) return;
  // });

  return [];
}
