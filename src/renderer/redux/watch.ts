import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Entry, Server, Video } from '../types';

type InitialState = {
  entry: Entry | null;
  episodeIdx: number;
  episode: { servers: Server[]; serverIdx: number; video: Video | null } | null;
};
const initialState = {
  entry: null,
  episodeIdx: -1,
  episode: null,
} as InitialState;

const {
  electron: { store },
} = window;

export const fetchEntry = createAsyncThunk(
  'entry/fetch',
  async (key: string) => {
    const res = await store.get(`entries.${key}`);
    return res;
  },
);

export const changeEpisode = createAsyncThunk(
  'episode/change',
  async ({ episodeIdx, entry }: { episodeIdx: number; entry: Entry }) => {
    const { getServers, getVideo } = await import(`../extensions/${entry.ext}`);
    const servers = (await getServers(entry.episodes[episodeIdx])) as Server[];
    const { preferredServ } = entry;
    const serverIdx = servers.findIndex(({ name }) => name === preferredServ);
    const video = (await getVideo(servers[serverIdx])) as Video;

    return { servers, serverIdx, video };
  },
);
export const changeServer = createAsyncThunk(
  'server/change',
  async ({ server, entry }: { server: Server; entry: Entry }) => {
    const { getVideo } = await import(`../extensions/${entry.ext}`);
    const video = (await getVideo(server)) as Video;

    return video;
  },
);

const watch = createSlice({
  name: 'watch',
  initialState,
  reducers: {
    setEntry: (state, action: PayloadAction<Entry>) => {
      state.entry = action.payload;
    },
    setEpisode: (state, action: PayloadAction<number>) => {
      state.episodeIdx = action.payload;
    },
    next: (state) => {
      if (state.entry && state.episodeIdx < state.entry.episodes.length - 1)
        state.episodeIdx += 1;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchEntry.fulfilled, (state, action) => {
      state.entry = action.payload;
    });
    builder.addCase(changeEpisode.fulfilled, (state, action) => {
      if (action.payload) state.episode = action.payload;
    });
    builder.addCase(changeServer.fulfilled, (state, action) => {
      if (state.episode) state.episode.video = action.payload;
    });
  },
});

export const { setEntry, setEpisode, next } = watch.actions;
export default watch.reducer;
