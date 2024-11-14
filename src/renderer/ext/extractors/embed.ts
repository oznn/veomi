const { electron } = window;

export default function extractor(embedURL: string, patterns: string[]) {
  const urls: string[] = [];
  electron.session.search(patterns);
  const iframe = document.createElement('iframe');
  iframe.src = embedURL;
  iframe.style.display = 'none';
  document.body.append(iframe);

  return new Promise((resolve) => {
    const unsub = electron.ipcRenderer.on('session-match-found', (url) => {
      urls.push(url as string);
      if ((url as string).includes(patterns.at(-1) || '')) {
        document.body.removeChild(iframe);
        resolve(urls);
        unsub();
      }
    });
  });
}
