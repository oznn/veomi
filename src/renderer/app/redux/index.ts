import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type {
  Chapter,
  Entry,
  Episode,
  PlayerSettings,
  Queue,
  ReaderSettings,
  ReadingMode,
  Server,
  Video,
} from '@types';

const { electron } = window;

type InitialState = {
  entry: Entry | null;
  video: Video | null | undefined;
  mediaIdx: number;
  sourceIdx: number;
  trackIdx: number;
  server: {
    idx: number;
    list: Server[] | null;
    retries: 0;
  };
  queue: Queue | [];
  entryRefresh: number;
  addedExtensions: string[] | [];
};

const initialState = {
  entry: null,
  video: null,
  mediaIdx: 0,
  sourceIdx: 0,
  trackIdx: 0,
  server: { idx: 0, list: null },
  queue: [],
  entryRefresh: 0,
  addedExtensions: [],
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
        if (!state.entry.posterPath)
          electron.poster.download(
            state.entry.result.posterURL,
            state.entry.key,
          );
      }
    },
    setVolume: (state, action: PayloadAction<number>) => {
      if (state.entry) {
        (state.entry.settings as PlayerSettings).volume = action.payload;
        const key = `entries.${state.entry.key}.settings.volume`;
        electron.store.set(key, action.payload);
      }
    },
    setEpisodeCurrentTime: (
      state,
      action: PayloadAction<{ mediaIdx: number; time: number }>,
    ) => {
      if (state.entry) {
        const { mediaIdx, time } = action.payload;
        (state.entry.media[mediaIdx] as Episode).currentTime = time;
      }
    },
    toggleAutoSkip: (state, action: PayloadAction<'intro' | 'outro'>) => {
      if (state.entry) {
        const value = !(state.entry.settings as PlayerSettings).isAutoSkip[
          action.payload
        ];
        (state.entry.settings as PlayerSettings).isAutoSkip[action.payload] =
          value;
        const key = `entries.${state.entry.key}.settings.isAutoSkip.${action.payload}`;
        electron.store.set(key, value);
      }
    },
    setMediaIdx: (state, action: PayloadAction<number>) => {
      state.mediaIdx = action.payload;
      state.video = null;
    },
    setSourceIdx: (state, action: PayloadAction<number>) => {
      state.sourceIdx = action.payload;
      if (state.entry && state.video) {
        const k = `entries.${state.entry.key}.settings.preferredQuality`;
        const { qual } = state.video.sources[action.payload];

        (state.entry.settings as PlayerSettings).preferredQuality = qual;
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
        (state.entry.settings as PlayerSettings).preferredSubtitles =
          preferredSubtitles;
        electron.store.set(k, preferredSubtitles);
      }
    },
    setPlaybackRate: (state, action: PayloadAction<number>) => {
      if (state.entry) {
        (state.entry.settings as PlayerSettings).playbackRate = action.payload;
        const key = `entries.${state.entry.key}.settings.playbackRate`;
        electron.store.set(key, action.payload);
      }
    },
    setServer: (state, action: PayloadAction<InitialState['server']>) => {
      state.server = action.payload;
    },
    setServerIdx: (state, action: PayloadAction<number>) => {
      state.server.idx = action.payload;
      state.video = null;
      if (
        state.entry &&
        state.server.list &&
        state.server.list[state.server.idx].name !== 'local'
      ) {
        const k = `entries.${state.entry.key}.settings.preferredServer`;
        (state.entry.settings as PlayerSettings).preferredServer =
          state.server.list[state.server.idx].name;
        electron.store.set(k, state.server.list[state.server.idx].name);
      }
    },
    serverRetry: (state) => {
      state.server.retries += 1;
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
    setMedia: (state, action: PayloadAction<Episode[] | Chapter[]>) => {
      if (state.entry) {
        const { media } = state.entry;

        for (let i = 0; i < state.entry.media.length; i += 1) {
          media[i].title = action.payload[i].title;
          media[i].info = action.payload[i].info;
          media[i].id = action.payload[i].id;
        }
        for (let i = media.length; i < action.payload.length; i += 1)
          (media as Episode[]).push(action.payload[i] as Episode);

        const k = `entries.${state.entry.key}.media`;
        electron.store.set(k, JSON.parse(JSON.stringify(media)));
      }
    },
    toggleIsSeen(
      state,
      action: PayloadAction<{ arr: number[]; val: boolean }>,
    ) {
      if (state.entry) {
        action.payload.arr.forEach((n) => {
          if (state.entry) {
            const k = `entries.${state.entry.key}.media.${n}.isSeen`;
            state.entry.media[n].isSeen = action.payload.val;
            electron.store.set(k, action.payload.val);
          }
        });
      }
    },
    setMarkAsSeenPercent(state, action: PayloadAction<number>) {
      if (state.entry) {
        (state.entry.settings as PlayerSettings).markAsSeenPercent =
          action.payload;
        const k = `entries.${state.entry.key}.settings.markAsSeenPercent`;
        electron.store.set(k, action.payload);
      }
    },
    setQueue(state, action: PayloadAction<Queue>) {
      state.queue = action.payload;
      electron.store.set('queue', action.payload);
    },
    setQueueProgress(state, action: PayloadAction<number>) {
      const idx = state.queue.findIndex(({ isFailed }) => !isFailed);
      if (idx > -1) state.queue[idx].progress = action.payload;
    },
    removeDownloadedMedia(state) {
      if (state.entry) {
        state.entry.media.forEach((e) => {
          e.downloaded = undefined;
        });
        const k = `entries.${state.entry.key}.media`;
        electron.store.set(k, JSON.parse(JSON.stringify(state.entry.media)));
      }
    },
    setEntryProp(state, action: PayloadAction<{ k: string; v: any }>) {
      if (state.entry) {
        const { k, v } = action.payload;

        k.split('.').reduce((obj: any, key: any, idx, arr) => {
          if (idx === arr.length - 1) obj[key] = v;
          return obj[key];
        }, state.entry);

        if (v !== undefined)
          electron.store.set(
            `entries.${state.entry.key}.${k}`,
            JSON.parse(JSON.stringify(v)),
          );
      }
    },
    setReadingMode: (state, action: PayloadAction<ReadingMode>) => {
      if (state.entry) {
        (state.entry.settings as ReaderSettings).mode = action.payload;
        const key = `entries.${state.entry.key}.settings.mode`;
        electron.store.set(key, action.payload);
      }
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      if (state.entry) {
        (state.entry.media[state.mediaIdx] as Chapter).currentPage =
          action.payload;
        const k = `entries.${state.entry.key}.media.${state.mediaIdx}`;
        electron.store.set(`${k}.currentPage`, action.payload);
      }
    },
    refreshEntry: (state) => {
      state.entryRefresh += 1;
    },
    setAddedExtensions: (state, action: PayloadAction<string[]>) => {
      state.addedExtensions = action.payload;
      electron.store.set('addedExtensions', action.payload);
    },
  },
});

export const {
  setEntry,
  addToLib,
  setVolume,
  setEpisodeCurrentTime,
  setPlaybackRate,
  toggleAutoSkip,
  setMediaIdx,
  setServer,
  setVideo,
  setTrackIdx,
  setSourceIdx,
  setServerIdx,
  setMedia,
  toggleIsSeen,
  setMarkAsSeenPercent,
  serverRetry,
  setQueue,
  setQueueProgress,
  removeDownloadedMedia,
  setEntryProp,
  setReadingMode,
  setCurrentPage,
  refreshEntry,
  setAddedExtensions,
} = app.actions;
export default app.reducer;
