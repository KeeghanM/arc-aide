import { create } from 'zustand'

interface IAppState {
  sidebarIsOpen: boolean
  setSidebarIsOpen: (isOpen: boolean) => void
  user: {
    name: string
  } | null
  setUser: (user: { name: string }) => void
  campaignSlug: string | undefined
  setCampaignSlug: (slug: string | undefined) => void
}
export const useAppStore = create<IAppState>()((set) => ({
  sidebarIsOpen: false,
  setSidebarIsOpen: (isOpen) => set({ sidebarIsOpen: isOpen }),
  user: null,
  setUser: (user) => set({ user }),
  campaignSlug: undefined,
  setCampaignSlug: (slug) => set({ campaignSlug: slug }),
}))
