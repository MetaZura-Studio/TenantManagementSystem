import { StateCreator } from "zustand"
import type { Settings } from "@/features/settings/types"

export interface SettingsSlice {
  settings: Settings[]
  setSettings: (settings: Settings[]) => void
  updateSetting: (key: string, value: string, category: string) => void
}

export const createSettingsSlice: StateCreator<
  SettingsSlice,
  [],
  [],
  SettingsSlice
> = (set) => ({
  settings: [],
  setSettings: (settings) => set({ settings }),
  updateSetting: (key, value, category) =>
    set((state) => {
      const existing = state.settings.find((s) => s.key === key)
      if (existing) {
        return {
          settings: state.settings.map((s) =>
            s.key === key ? { ...s, value, updatedAt: new Date().toISOString() } : s
          ),
        }
      }
      return {
        settings: [
          ...state.settings,
          {
            id: `setting-${Date.now()}`,
            key,
            value,
            category,
            updatedAt: new Date().toISOString(),
          },
        ],
      }
    }),
})
