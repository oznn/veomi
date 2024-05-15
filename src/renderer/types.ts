export type Result = Required<{
  title: string;
  poster: string;
  path: string;
}> & {
  [key: string]: any;
};

export type Entry = {
  details: { title: string; poster: string };
  episodes: { title: string; info: string[] }[];
  isInLibary: boolean;
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
