import type { campaign } from '@/lib/db/schema'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usePostHog } from 'posthog-js/react'

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

  const campaignQuery = useQuery({
    queryKey: ['campaign'],
    queryFn: async (campaignId: string): Promise<TCampaign> => {
      const response = await fetch(`/api/campaigns/${campaignId}`)
      return response.json()
    },
  })

  const createCampaign = useMutation({
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

  const deleteCampaign = useMutation({
    mutationFn: async (campaignId: number) => {
      await fetch(`/api/campaigns/${campaignId}`, {
        method: 'DELETE',
      })

      posthog?.capture('campaign_deleted', { id: campaignId })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    },
  })

  const modifyCampaign = useMutation({
    mutationFn: async (updatedCampaign: {
      id: number
      name: string
      description: string | null
    }) => {
      await fetch(`/api/campaigns/${updatedCampaign.id}`, {
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
