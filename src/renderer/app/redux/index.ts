import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Entry, Episode, Server, Video } from '../../types.d.ts';

const { electron } = window;

type InitialState = {
  entry: Entry | null;
  video: Video | null | undefined;
  episodeIdx: number;
  sourceIdx: number;
  trackIdx: number;
  server: {
    idx: number;
    list: Server[] | null;
  };
};

const initialState = {
  entry: null,
  video: null,
  episodeIdx: 0,
  sourceIdx: 0,
  trackIdx: 0,
  server: { idx: 0, list: null },
} as InitialState;

const app = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setEntry: (state, action: PayloadAction<Entry | null>) => {
      state.entry = action.payload;
      if (action.payload)
        electron.store.set(`entries.${action.payload.key}`, action.payload);
    },
    addToLib: (state) => {
      if (state.entry) {
        state.entry.isInLibary = true;
        electron.store.set(`entries.${state.entry.key}.isInLibary`, true);
        electron.poster.download(state.entry.result.posterURL, state.entry.key);
      }
    },
    setVolume: (state, action: PayloadAction<number>) => {
      if (state.entry) {
        state.entry.settings.volume = action.payload;
        const key = `entries.${state.entry.key}.settings.volume`;
        electron.store.set(key, action.payload);
      }
    },
    setEpisodeCurrentTime: (
      state,
      action: PayloadAction<{ episodeIdx: number; time: number }>,
    ) => {
      if (state.entry) {
        const { episodeIdx, time } = action.payload;
        state.entry.episodes[episodeIdx].currentTime = time;
      }
    },
    toggleAutoSkip: (state, action: PayloadAction<'intro' | 'outro'>) => {
      if (state.entry) {
        const value = !state.entry.settings.isAutoSkip[action.payload];
        state.entry.settings.isAutoSkip[action.payload] = value;
        const key = `entries.${state.entry.key}.settings.isAutoSkip.${action.payload}`;
        electron.store.set(key, value);
      }
    },
    setEpisodeIdx: (state, action: PayloadAction<number>) => {
      state.episodeIdx = action.payload;
      state.video = null;
    },
    setSourceIdx: (state, action: PayloadAction<number>) => {
      state.sourceIdx = action.payload;
      if (state.entry && state.video) {
        const k = `entries.${state.entry.key}.settings.preferredQuality`;
        const { qual } = state.video.sources[action.payload];

        state.entry.settings.preferredQuality = qual;
        electron.store.set(k, qual);
      }
    },
    setTrackIdx: (state, action: PayloadAction<number>) => {
      state.trackIdx = action.payload;
      if (state.entry && state.video?.tracks) {
        const k = `entries.${state.entry.key}.settings.preferredSubtitles`;
        const preferredSubtitles =
          action.payload > -1
            ? state.video.tracks[action.payload].label.split(' ')[0]
            : '-';
        state.entry.settings.preferredSubtitles = preferredSubtitles;
        electron.store.set(k, preferredSubtitles);
      }
    },
    setPlayback: (state, action: PayloadAction<number>) => {
      if (state.entry) {
        state.entry.settings.playback = action.payload;
        const key = `entries.${state.entry.key}.settings.playback`;
        electron.store.set(key, action.payload);
      }
    },
    setServer: (state, action: PayloadAction<InitialState['server']>) => {
      state.server = action.payload;
    },
    setServerIdx: (state, action: PayloadAction<number>) => {
      state.server.idx = action.payload;
      state.video = null;
      if (state.server.list && state.entry) {
        const k = `entries.${state.entry.key}.settings.preferredServer`;
        state.entry.settings.preferredServer =
          state.server.list[state.server.idx].name;
        electron.store.set(k, state.server.list[state.server.idx].name);
      }
    },
    setVideo: (
      state,
      action: PayloadAction<{
        video: InitialState['video'];
        sourceIdx?: number;
        trackIdx?: number;
      }>,
    ) => {
      state.video = action.payload.video;
      if (typeof action.payload.sourceIdx === 'number')
        state.sourceIdx = action.payload.sourceIdx;
      if (typeof action.payload.trackIdx === 'number')
        state.trackIdx = action.payload.trackIdx;
    },
    setEpisodes: (state, action: PayloadAction<Episode[]>) => {
      if (state.entry) {
        const { episodes } = state.entry;

        for (let i = 0; i < state.entry.episodes.length; i += 1) {
          episodes[i].title = action.payload[i].title;
          episodes[i].info = action.payload[i].info;
        }
        for (let i = episodes.length; i < action.payload.length; i += 1)
          episodes.push(action.payload[i]);
      }
    },
    toggleIsSeen(state, action: PayloadAction<number[]>) {
      if (state.entry) {
        const seenLength = action.payload.filter(
          (e) => state.entry?.episodes[e].isSeen,
        ).length;
        const toggle = seenLength * 2 > action.payload.length;

        action.payload.forEach((n) => {
          if (state.entry) {
            const k = `entries.${state.entry.key}.episodes.${n}.isSeen`;
            state.entry.episodes[n].isSeen = !toggle;
            electron.store.set(k, !toggle);
          }
        });
      }
    },
    setMarkAsSeenPercent(state, action: PayloadAction<number>) {
      if (state.entry) {
        state.entry.settings.markAsSeenPercent = action.payload;
        const k = `entries.${state.entry.key}.settings.markAsSeenPercent`;
        electron.store.set(k, action.payload);
      }
    },
  },
});

export const {
  setEntry,
  addToLib,
  setVolume,
  setEpisodeCurrentTime,
  setPlayback,
  toggleAutoSkip,
  setEpisodeIdx,
  setServer,
  setVideo,
  setTrackIdx,
  setSourceIdx,
  setServerIdx,
  setEpisodes,
  toggleIsSeen,
  setMarkAsSeenPercent,
} = app.actions;
export default app.reducer;
