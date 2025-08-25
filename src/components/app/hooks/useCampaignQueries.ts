import type { campaign } from '@db/schema'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { usePostHog } from 'posthog-js/react'
import { useSyncMutation } from './useSyncMutation'

export type TCampaign = typeof campaign.$inferSelect

export function useCampaignQueries() {
  const posthog = usePostHog()
  const queryClient = useQueryClient()

  const campaignsQuery = useQuery({
    queryKey: ['campaigns'],
    queryFn: async (): Promise<TCampaign[]> => {
      const response = await fetch('/api/campaigns')
      return response.json()
    },
  })

  const campaignQuery = (slug: string) =>
    useQuery({
      queryKey: ['campaign', slug],
      queryFn: async ({ queryKey }): Promise<TCampaign> => {
        const [_key, campaignSlug] = queryKey
        const response = await fetch(`/api/campaigns/${campaignSlug}`)
        return response.json()
      },
    })

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    },
  })

  const deleteCampaign = useSyncMutation({
    mutationFn: async (slug: number) => {
      await fetch(`/api/campaigns/${slug}`, {
        method: 'DELETE',
      })

      posthog?.capture('campaign_deleted', { id: slug })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    },
  })

  const modifyCampaign = useSyncMutation({
    mutationFn: async (updatedCampaign: {
      slug: string
      name: string
      description: string | null
    }) => {
      await fetch(`/api/campaigns/${updatedCampaign.slug}`, {
        method: 'PUT',
        body: JSON.stringify({ updatedCampaign }),
        headers: { 'Content-Type': 'application/json' },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    },
  })

  return {
    campaignsQuery,
    campaignQuery,
    createCampaign,
    deleteCampaign,
    modifyCampaign,
  }
}
