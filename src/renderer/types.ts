export type Result = {
  ext: string;
  path: string;
  title: string;
  poster: string;
};
export type Episode = Required<{
  title: string;
  info: string[];
  isSeen: boolean;
  progress: number;
}> & {
  [key: string]: any;
};
export type Entry = {
  details: {
    title: string;
    poster: string;
    isCompleted: boolean | null;
    dataId?: string;
  };
  episodes: Episode[];
  isInLibary: boolean;
  isSkip: { intro: boolean; outro: boolean };
  volume: number;
  ext: string;
  path: string;
  key: string;
  preferredSubs: string;
  preferredQual: string;
  preferredServ: string;
};
export type Server = Required<{
  name: string;
}> & {
  [key: string]: any;
};
export type Source = { file: string; qual: string };
export type Track = {
  file: string;
  label: string;
  caption: string;
  defualt?: boolean;
};
export type Video = {
  sources: Source[];
  tracks: Track[];
  skips: { intro: number[]; outro: number[] };
};
