import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface Dot {
  id: string;
  x: number;
  y: number;
  radius: number;
}

interface DotsState {
  photoDots: Dot[];
  artDots: Dot[];
  history: { photo: Dot[]; art: Dot[] }[];
  future: { photo: Dot[]; art: Dot[] }[];
  addDot: (dot: Dot) => void;
  undo: () => void;
  redo: () => void;
  reset: () => void;
  randomize: () => void;
  centerize: () => void;
}

export const useDotsStore = create<DotsState>()(
  devtools((set, get) => ({
    photoDots: [],
    artDots: [],
    history: [],
    future: [],

    addDot: (dot) => {
      const { photoDots, artDots, history } = get();
      set({
        photoDots: [...photoDots, dot],
        artDots: [...artDots, dot],
        history: [...history, { photo: photoDots, art: artDots }],
        future: [],
      });
    },

    centerize: () => {
      const { photoDots, artDots, history } = get();
      if (!artDots.length) return;

      const compress = 0.5;
      const centerX = 0.5;
      const centerY = 0.5;

      const newArtDots = artDots.map((d) => ({
        ...d,
        x: centerX + (d.x - centerX) * compress,
        y: centerY + (d.y - centerY) * compress,
      }));

      set({
        artDots: newArtDots,
        history: [...history, { photo: photoDots, art: artDots }],
        future: [],
      });
    },

    undo: () => {
      const { history, photoDots, artDots, future } = get();
      if (!history.length) return;

      const prev = history[history.length - 1];
      set({
        photoDots: prev.photo,
        artDots: prev.art,
        history: history.slice(0, -1),
        future: [...future, { photo: photoDots, art: artDots }],
      });
    },

    redo: () => {
      const { future, history, photoDots, artDots } = get();
      if (!future.length) return;

      const next = future[future.length - 1];
      set({
        photoDots: next.photo,
        artDots: next.art,
        history: [...history, { photo: photoDots, art: artDots }],
        future: future.slice(0, -1),
      });
    },

    reset: () => set({ photoDots: [], artDots: [], history: [], future: [] }),

    randomize: () => {
      const { photoDots, artDots } = get();
      const random = (d: Dot) => ({ ...d, x: Math.random(), y: Math.random() });

      set({
        photoDots: photoDots.map(random),
        artDots: artDots.map(random),
        history: [],
        future: [],
      });
    },
  }))
);
