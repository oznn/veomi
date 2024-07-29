export type Result = {
  ext: string;
  path: string;
  title: string;
  posterURL: string;
};
export type Episode = {
  id: string;
  title: string;
  isFiller: boolean;
  number: string;
  isSeen: boolean;
  progress: number;
  download: {
    progress: number;
    isPending: boolean;
    isCompleted: boolean;
    path?: string;
  };
  info?: string[];
};
export type Entry = {
  details: {
    id: string;
    title: string;
    posterURL: string;
    isCompleted: boolean | null;
    studio: string;
    desc: string;
    posterPath?: string;
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
export type Server = {
  name: string;
  id: string;
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
