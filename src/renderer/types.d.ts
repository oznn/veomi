export type Result = {
  title: string;
  posterURL: string;
  ext: string;
  path: string;
  type: 'VIDEO' | 'IMAGE';
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
export type PlayerSettings = {
  volume: number;
  playbackRate: number;
  isAutoSkip: { intro: boolean; outro: boolean };
  markAsSeenPercent: number;
  preferredQuality: number;
  preferredSubtitles: string;
  preferredServer: string;
};
export type Chapter = {
  id: string;
  title: string;
  isSeen: boolean;
  currentPage: number;
  downloaded?: string[];
  info?: string[];
};
export type ReadingMode = 'ltr' | 'rtl' | 'ttb' | 'btt' | 'scroll';
export type ReaderSettings = {
  mode: ReadingMode;
  zoom: number;
  yScrollFactor: number;
};

export type Entry = {
  key: string;
  result: Result;
  isInLibary: boolean;
  category: string;
  media: Episode[] | Chapter[];
  settings: PlayerSettings | ReaderSettings;
  details?: Details;
  posterPath?: string;
};
export type Server = {
  name: string;
  id: string;
  [key: string]: any;
};

export type Queue = {
  entryKey: string;
  mediaKey: string;
  mediaIdx: number;
  entryTitle: string;
  mediaTitle: string;
  mediaType: 'VIDEO' | 'IMAGE';
  progress: number;
  isFailed: boolean;
}[];
