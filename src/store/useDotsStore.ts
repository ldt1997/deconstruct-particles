import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface Dot {
  id: string
  x: number
  y: number
  radius: number
}

interface DotsState {
  dots: Dot[]
  history: Dot[][]
  future: Dot[][]
  addDot: (dot: Dot) => void
  undo: () => void
  redo: () => void
  reset: () => void
  randomize: () => void
}

export const useDotsStore = create<DotsState>()(
  devtools((set, get) => ({
    dots: [],
    history: [],
    future: [],
    addDot: (dot) => {
      const { dots, history } = get()
      set({
        dots: [...dots, dot],
        history: [...history, dots],
        future: [],
      })
    },
    undo: () => {
      const { history, dots, future } = get()
      if (history.length === 0) return
      const prev = history[history.length - 1]
      set({
        dots: prev,
        history: history.slice(0, -1),
        future: [dots, ...future],
      })
    },
    redo: () => {
      const { future, dots, history } = get()
      if (future.length === 0) return
      const next = future[0]
      set({
        dots: next,
        history: [...history, dots],
        future: future.slice(1),
      })
    },
    reset: () => set({ dots: [], history: [], future: [] }),
    randomize: () => {
      const { dots } = get()
      const randomized = dots.map((d) => ({
        ...d,
        x: Math.random(),
        y: Math.random(),
      }))
      set({ dots: randomized, history: [], future: [] })
    },
  }))
)
