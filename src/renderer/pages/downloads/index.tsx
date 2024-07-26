import { useEffect } from 'react';

export default function Downloads() {
  useEffect(() => {
    (async () => {
      window.electron.ipcRenderer.on('video-progress', (l) => {
        console.log('from downloads page', l as any);
      });
    })();
  }, []);

  return <h1>download queue</h1>;
}
