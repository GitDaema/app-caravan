import { create } from 'zustand'

type UIState = {
  selectedCaravanId: number | null
  setSelectedCaravanId: (id: number | null) => void
}

export const useUIStore = create<UIState>((set) => ({
  selectedCaravanId: null,
  setSelectedCaravanId: (id) => set({ selectedCaravanId: id })
}))

