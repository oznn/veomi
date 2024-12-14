import { Result } from '@types';

const ext = 'wecima';
const baseURL = 'https://wecima.movie';
const parser = new DOMParser();
const parseHTML = (html: string) => parser.parseFromString(html, 'text/html');

export async function getResults(q: string) {
  const results: Result[] = [];
  const res = await fetch(`${baseURL}/AjaxCenter/Searching/${q}`);
  const { output } = await res.json();
  const doc = parseHTML(output);

  doc.querySelectorAll('.Thumb--GridItem a').forEach((e) => {
    const path = e.getAttribute('href') || '';
    const title = e.getAttribute('title') || '';
    const a = e.querySelector('span')?.getAttribute('data-lazy-style') || '';
    const [posterURL] = /\(.*\)/.exec(a) || [''];

    results.push({
      ext,
      type: 'VIDEO',
      path,
      title,
      posterURL: posterURL.slice(1, -1),
    });
  });

  return results;
}

export const a = 1;
