import getSources from '../../utils/getSourcesFromPlaylist';
import channels from './channels';

const { electron } = window;
const ext = 'dlhd';
const baseURL = 'https://cookiewebplay.xyz';

export async function getResults(q: string) {
  return channels
    .filter((c) => c.title.toLowerCase().includes(q.toLowerCase()))
    .map((c) => ({
      title: c.title,
      path: c.id,
      ext,
      posterURL: '',
      type: 'LIVE',
    }));
}

export async function getStream(path: string) {
  const res = await fetch(`${baseURL}/premiumtv/daddylivehd.php?id=${path}`);
  const html = await res.text();
  const [playlistURL] = /'(.*)\.m3u8'/.exec(html) || [''];
  const sources = await getSources(playlistURL.slice(1, -1));

  electron.ipcRenderer.sendMessage('change-origin', baseURL);
  electron.ipcRenderer.sendMessage('change-referrer', `${baseURL}/`);

  return sources;
}
