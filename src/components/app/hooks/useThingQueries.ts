import type { thing } from '@db/schema'
import { useSyncMutation } from '@hooks/useSyncMutation'
import { useAppStore } from '@stores/appStore'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { usePostHog } from 'posthog-js/react'
import type { TArc, TRelatedItem } from './useArcQueries'

export type TThing = typeof thing.$inferSelect

/**
 * Thing Data Management Hook
 *
 * Manages CRUD operations for campaign "Things" - entities like characters,
 * locations, items, NPCs, etc. Things are categorized by type and can be
 * associated with multiple arcs through many-to-many relationships.
 */
export function useThingQueries() {
  const posthog = usePostHog()
  const queryClient = useQueryClient()

  const { campaignSlug } = useAppStore()

  // --- Data fetching ---
  type TUseThingsQuery =
    | { count: number; fetchAll?: undefined }
    | { fetchAll: true; count?: undefined }

  const useThingsQuery = (params: TUseThingsQuery) =>
    useQuery({
      queryKey: [
        'things',
        campaignSlug,
        params.count ?? (params.fetchAll ? 'all' : undefined),
      ],
      queryFn: async ({ queryKey }): Promise<TThing[]> => {
        const [_key, slug] = queryKey
        const url = new URL(
          `/api/campaigns/${slug}/things`,
          window.location.origin
        )
        if ('fetchAll' in params && params.fetchAll) {
          url.searchParams.append('fetchAll', 'true')
        } else if ('count' in params && params.count !== undefined) {
          url.searchParams.append('count', params.count.toString())
        }

        const response = await fetch(url)
        return response.json()
      },
    })

  // Individual thing query factory
  const useThingQuery = (thingSlug: string) =>
    useQuery({
      queryKey: ['thing', campaignSlug, thingSlug],
      queryFn: async ({ queryKey }): Promise<TThing> => {
        const [_key, campaignSlug, thingSlug] = queryKey
        const response = await fetch(
          `/api/campaigns/${campaignSlug}/things/${thingSlug}`
        )
        return response.json()
      },
    })

  // Get all arcs that contain a specific thing (many-to-many relationship)
  const useArcsWithThingQuery = (thingSlug: string) => {
    return useQuery({
      queryKey: ['arcs-with-thing', campaignSlug, thingSlug],
      queryFn: async ({ queryKey }): Promise<TArc[]> => {
        const [_key, campaignSlug, thingSlug] = queryKey
        const response = await fetch(
          `/api/campaigns/${campaignSlug}/things/${thingSlug}/arcs`
        )
        return response.json()
      },
    })
  }

  // --- Mutations ---
  // Associate a thing with an arc (many-to-many relationship)

  const addThingToArc = useSyncMutation({
    mutationFn: async ({
      arcSlug,
      thingSlug,
    }: {
      arcSlug: string
      thingSlug: string
    }) => {
      await fetch(`/api/campaigns/${campaignSlug}/things/${thingSlug}/arcs`, {
        method: 'POST',
        body: JSON.stringify({ arcSlug }),
        headers: { 'Content-Type': 'application/json' },
      })
      posthog?.capture('thing_added_to_arc', {
        arcSlug,
        thingSlug,
        campaignSlug,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['things'],
      })
      queryClient.invalidateQueries({
        queryKey: ['arcs-with-thing'],
      })
      queryClient.invalidateQueries({
        queryKey: ['arcs'],
      })
    },
  })

  const createThing = useSyncMutation({
    mutationFn: async ({
      newThing,
    }: {
      newThing: { name: string; typeId: number }
    }): Promise<TThing> => {
      const response = await fetch(`/api/campaigns/${campaignSlug}/things`, {
        method: 'POST',
        body: JSON.stringify({ newThing }),
        headers: { 'Content-Type': 'application/json' },
      })

      posthog?.capture('thing_created', {
        name: newThing.name,
        typeId: newThing.typeId,
        campaignSlug,
      })

      return await response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['things'],
      })
    },
  })

  const deleteThing = useSyncMutation({
    mutationFn: async ({ thingSlug }: { thingSlug: string }) => {
      await fetch(`/api/campaigns/${campaignSlug}/things/${thingSlug}`, {
        method: 'DELETE',
      })

      posthog?.capture('thing_deleted', {
        thingSlug,
        campaignSlug,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['things'],
      })
    },
  })

  const modifyThing = useSyncMutation({
    mutationFn: async ({
      updatedThing,
      relatedItems,
    }: {
      updatedThing: Partial<TThing> & { slug: string }
      relatedItems?: TRelatedItem[]
    }): Promise<TThing> => {
      const response = await fetch(
        `/api/campaigns/${campaignSlug}/things/${updatedThing.slug}`,
        {
          method: 'PUT',
          body: JSON.stringify({ updatedThing, relatedItems }),
          headers: { 'Content-Type': 'application/json' },
        }
      )

      posthog?.capture('thing_modified', {
        thingSlug: updatedThing.slug,
        campaignSlug,
      })

      const data = await response.json()
      console.log({ data })
      return data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['things', campaignSlug],
      })
      queryClient.invalidateQueries({
        queryKey: ['thing', campaignSlug, variables.updatedThing.slug],
      })
    },
  })

  return {
    useThingsQuery,
    useThingQuery,
    useArcsWithThingQuery,
    createThing,
    deleteThing,
    modifyThing,
    addThingToArc,
  }
}
