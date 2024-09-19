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
  skips?: Skips;
};
export type Episode = {
  id: string;
  title: string;
  currentTime: number;
  isSeen: boolean;
  downloaded?: Video;
  info?: string[];
  isFiller?: boolean;
};
export type Details = {
  info: string[];
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
    playback: number;
    isAutoSkip: { intro: boolean; outro: boolean };
    markAsSeenPercent: number;
    preferredQuality: number;
    preferredSubtitles: string;
    preferredServer: string;
  };
};
export type Server = {
  name: string;
  id: string;
  [key: string]: any;
};

export type Queue = {
  entryKey: string;
  episodeKey: string;
  episodeIdx: number;
  entryTitle: string;
  episodeTitle: string;
  progress: number;
}[];
