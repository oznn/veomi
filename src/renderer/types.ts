export type Result = Required<{
  ext: string;
  path: string;
  title: string;
  poster: string;
}> & {
  [key: string]: any;
};
export type Episode = Required<{
  title: string;
  info: string[];
  isSeen: boolean;
}> & {
  [key: string]: any;
};
export type Entry = {
  details: { title: string; poster: string };
  episodes: Episode[];
  isInLibary: boolean;
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
