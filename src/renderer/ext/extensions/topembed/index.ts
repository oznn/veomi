import { Result } from '@types';
import getSources from '../../utils/getSourcesFromPlaylist';
import channels from './channels';

const ext = 'topembed';
const baseURL = 'https://topembed.pw';
const { electron } = window;

export async function getResults(q: string) {
  return channels
    .filter((c) => c.toLowerCase().includes(q.toLowerCase()))
    .map((c) => ({
      title: c,
      path: c,
      ext,
      posterURL: '',
      type: 'LIVE',
    }));
}

export async function getStream(path: string) {
  const res = await fetch(`${baseURL}/channel/${path}`);
  const html = await res.text();
  const [playlistURL] = /'(.*)\.m3u8'/.exec(html) || [''];
  const sources = await getSources(playlistURL.slice(1, -1));

  electron.ipcRenderer.sendMessage('change-origin', baseURL);
  electron.ipcRenderer.sendMessage('change-referrer', `${baseURL}/`);

  return sources;
}
