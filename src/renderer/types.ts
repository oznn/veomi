export type Result = Required<{
  ext: string;
  path: string;
  title: string;
  poster: string;
}> & {
  [key: string]: any;
};

export type Entry = {
  ext: string;
  details: { title: string; poster: string };
  isInLibary: boolean;
  episodes: { title: string; info: string[] }[];
};
export type Episode = Required<{
  title: string;
  info: string[];
}> & {
  [key: string]: any;
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
