import type { arc } from '@/lib/db/schema'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { usePostHog } from 'posthog-js/react'
import { useAppStore } from '../stores/appStore'
import { useSyncMutation } from './useSyncMutation'

export type TArc = typeof arc.$inferSelect

export function useArcQueries() {
  const posthog = usePostHog()
  const queryClient = useQueryClient()

  const { campaignSlug } = useAppStore()

  const arcsQuery = useQuery({
    queryKey: ['arcs', campaignSlug],
    queryFn: async ({ queryKey }): Promise<TArc[]> => {
      const [_key, slug] = queryKey
      const response = await fetch(`/api/campaigns/${slug}/arcs`)
      return response.json()
    },
  })

  const arcQuery = (arcSlug: string) =>
    useQuery({
      queryKey: ['arc', campaignSlug, arcSlug],
      queryFn: async ({ queryKey }): Promise<TArc> => {
        const [_key, campaignSlug, arcSlug] = queryKey
        const response = await fetch(
          `/api/campaigns/${campaignSlug}/arcs/${arcSlug}`
        )
        return response.json()
      },
    })

  const createArc = useSyncMutation({
    mutationFn: async ({ newArc }: { newArc: { name: string } }) => {
      await fetch(`/api/campaigns/${campaignSlug}/arcs`, {
        method: 'POST',
        body: JSON.stringify({ newArc }),
        headers: { 'Content-Type': 'application/json' },
      })

      posthog?.capture('arc_created', {
        name: newArc.name,
        campaignSlug,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['arcs', campaignSlug],
      })
    },
  })

  const deleteArc = useSyncMutation({
    mutationFn: async ({ arcSlug }: { arcSlug: string }) => {
      await fetch(`/api/campaigns/${campaignSlug}/arcs/${arcSlug}`, {
        method: 'DELETE',
      })

      posthog?.capture('arc_deleted', {
        arcSlug,
        campaignSlug,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['arcs'],
      })
    },
  })

  const modifyArc = useSyncMutation({
    mutationFn: async ({
      updatedArc,
    }: {
      updatedArc: Partial<TArc> & { slug: string }
    }) => {
      await fetch(`/api/campaigns/${campaignSlug}/arcs/${updatedArc.slug}`, {
        method: 'PUT',
        body: JSON.stringify({ updatedArc }),
        headers: { 'Content-Type': 'application/json' },
      })

      posthog?.capture('arc_modified', {
        arcSlug: updatedArc.slug,
        campaignSlug,
      })
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['arcs'],
      })
      queryClient.invalidateQueries({
        queryKey: ['arc', campaignSlug, variables.updatedArc.slug],
      })
    },
  })

  return {
    arcsQuery,
    arcQuery,
    createArc,
    deleteArc,
    modifyArc,
  }
}
