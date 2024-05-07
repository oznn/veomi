export type Extension = { path: string; name: string };
export type Entry = { title: string; poster: string };
export type EpisodeType = 'sub' | 'softsub' | 'dub';
export type Episode = Partial<{
  title: string;
  releaseDate: string;
  types: EpisodeType[];
  isFiller: boolean;
}>;

export type Video = {
  sources: { file: string; qual: string }[];
  tracks: { file: string; label: string; caption: string; default?: boolean }[];
  origin: string;
  skips: { intro: number[]; outro: number[] };
};
