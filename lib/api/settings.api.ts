import { useStore } from "../store"
import type { Settings } from "@/features/settings/types"

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const settingsApi = {
  getAll: async (): Promise<Settings[]> => {
    await delay(300)
    return useStore.getState().settings
  },
  update: async (key: string, value: string, category: string): Promise<void> => {
    await delay(400)
    useStore.getState().updateSetting(key, value, category)
  },
}
