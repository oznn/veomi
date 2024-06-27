const { floor } = Math;
export function formatTime(t: number) {
  const s = t % 60;
  const m = floor((t / 60) % 60);
  const h = floor(t / 3600);
  const seconds = s < 10 ? `0${s}` : s;
  const minutes = h > 0 && m < 10 ? `0${m}:` : `${m}:`;
  const hours = h > 0 ? `${h}:` : '';

  return hours + minutes + seconds;
}
export const a = 1;
