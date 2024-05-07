import { useEffect, useState } from 'react';
import { Episode, Video } from '../../types';
import { ext } from '../../utils';
import Player from './Player';

export default function Playlist({ episodes }: { episodes: Episode[] }) {
  const [servers, setServers] = useState([]);
  const [video, setVideo] = useState<Video | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const url = `${ext.url}/${ext.path}/servers`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(episodes[0]),
        });
        setServers((await res.json()).servers);
      } catch (err) {
        console.log(`failed to set servers ${err}`);
      }
    })();
  }, [episodes]);

  useEffect(() => {
    if (servers.length === 0 || video) return;
    (async () => {
      try {
        const url = `${ext.url}/${ext.path}/video`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(servers[0]),
        });
        setVideo(await res.json());
      } catch (err) {
        console.log(`failed to set video ${err}`);
      }
    })();
  }, [servers, video]);

  if (servers.length === 0) return <h1>loading servers....</h1>;
  if (video === null) return <h1>loading video....</h1>;
  return <Player video={video} />;
}
