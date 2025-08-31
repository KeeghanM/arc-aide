import type { campaign } from '@db/schema'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { usePostHog } from 'posthog-js/react'
import type { Descendant } from 'slate'
import { useSyncMutation } from './useSyncMutation'

export type TCampaign = typeof campaign.$inferSelect

/**
 * Campaign Data Management Hook
 *
 * Provides CRUD operations for D&D campaigns with React Query caching
 * and PostHog analytics tracking. Campaigns are the top-level organization
 * unit that contain all arcs, things, and game content.
 */
export function useCampaignQueries() {
  const posthog = usePostHog()
  const queryClient = useQueryClient()

  // --- Data fetching ---
  const campaignsQuery = useQuery({
    queryKey: ['campaigns'],
    queryFn: async (): Promise<TCampaign[]> => {
      const response = await fetch('/api/campaigns')
      return response.json()
    },
  })

  // Factory function for individual campaign queries
  const useCampaignQuery = (slug: string) =>
    useQuery({
      queryKey: ['campaign', slug],
      queryFn: async ({ queryKey }): Promise<TCampaign> => {
        const [_key, campaignSlug] = queryKey
        const response = await fetch(`/api/campaigns/${campaignSlug}`)
        return response.json()
      },
    })

  // --- Mutations ---
  const createCampaign = useSyncMutation({
    mutationFn: async (newCampaign: { name: string }) => {
      await fetch('/api/campaigns', {
        method: 'POST',
        body: JSON.stringify({ newCampaign }),
        headers: { 'Content-Type': 'application/json' },
      })

      posthog?.capture('campaign_created', {
        name: newCampaign.name,
      })
    },
    // Invalidate campaigns list to trigger refetch
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    },
  })

  const deleteCampaign = useSyncMutation({
    mutationFn: async (slug: string) => {
      await fetch(`/api/campaigns/${slug}`, {
        method: 'DELETE',
      })

      posthog?.capture('campaign_deleted', { id: slug })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      window.location.href = '/dashboard/'
    },
  })

  const modifyCampaign = useSyncMutation({
    mutationFn: async (updatedCampaign: {
      campaignSlug: string
      name: string
      description?: Descendant[]
    }): Promise<TCampaign> => {
      const response = await fetch(
        `/api/campaigns/${updatedCampaign.campaignSlug}`,
        {
          method: 'PUT',
          body: JSON.stringify({ updatedCampaign }),
          headers: { 'Content-Type': 'application/json' },
        }
      )

      return await response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    },
  })

  return {
    campaignsQuery,
    useCampaignQuery,
    createCampaign,
    deleteCampaign,
    modifyCampaign,
  }
}
