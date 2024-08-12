export type Result = {
  title: string;
  posterURL: string;
  ext: string;
  path: string;
  [key: string]: any;
};
export type Source = { file: string; qual: number };
export type Track = { file: string; label: string };
export type Skips = { intro: number[]; outro: number[] };
export type Video = {
  sources: Source[];
  tracks?: Track[];
  skips: Skips;
};
export type Episode = {
  id: string;
  title: string;
  isSeen: boolean;
  progress: number;
  download: {
    progress: number;
    isPending: boolean;
    isCompleted: boolean;
    video?: Video;
  };
  info?: string[];
  isFiller?: boolean;
};
export type Details = {
  posterURL: string;
  status: string;
  studio: string;
  description: string;
};
export type Entry = {
  key: string;
  result: Result;
  episodes: Episode[];
  details?: Details;
  isInLibary: boolean;
  posterPath?: string;
  settings: {
    volume: number;
    isSkip: { intro: boolean; outro: boolean };
    preferredSubs: string;
    preferredQual: number;
    preferredServ: string;
  };
};
export type Server = {
  name: string;
  id: string;
  [key: string]: any;
};
