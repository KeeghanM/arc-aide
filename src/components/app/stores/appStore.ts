import type { User } from 'better-auth'
import { create } from 'zustand'

/**
 * Global Application State Store
 *
 * Manages client-side state that needs to be shared across components:
 * - UI state (sidebar visibility)
 * - User session context
 * - Current campaign context for navigation and API calls
 *
 * Uses Zustand for minimal boilerplate and good TypeScript support.
 * Server state (campaigns, arcs, things) is managed separately by React Query.
 */
interface IAppState {
  // --- UI State ---
  sidebarIsOpen: boolean
  setSidebarIsOpen: (isOpen: boolean) => void
  mode: 'edit' | 'view'
  setMode: (mode: 'edit' | 'view') => void

  // --- User Context ---
  user:
    | (User & {
        username?: string
        displayUsername?: string
      })
    | null
  setUser: (
    user: User & {
      username?: string
      displayUsername?: string
    }
  ) => void

  // --- Campaign Context ---
  // Current campaign slug is used for API calls and navigation
  campaignSlug: string | undefined
  setCampaignSlug: (slug: string | undefined) => void
}

export const useAppStore = create<IAppState>()((set) => ({
  sidebarIsOpen: false,
  setSidebarIsOpen: (isOpen) => set({ sidebarIsOpen: isOpen }),
  mode: 'edit',
  setMode: (mode) => set({ mode }),
  user: null,
  setUser: (user) => set({ user }),
  campaignSlug: undefined,
  setCampaignSlug: (slug) => set({ campaignSlug: slug }),
}))
