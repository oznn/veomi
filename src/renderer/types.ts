export type Entry = Required<{
  title: string;
  poster: string;
}> & {
  [key: string]: any;
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
