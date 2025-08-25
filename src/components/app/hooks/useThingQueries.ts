import type { thing } from '@db/schema'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { usePostHog } from 'posthog-js/react'
import { useAppStore } from '../stores/appStore'
import { useSyncMutation } from './useSyncMutation'

export type TThing = typeof thing.$inferSelect

export function useThingQueries() {
  const posthog = usePostHog()
  const queryClient = useQueryClient()

  const { campaignSlug } = useAppStore()

  const createThingsQuery = (count: number) =>
    useQuery({
      queryKey: ['things', campaignSlug, count],
      queryFn: async ({ queryKey }): Promise<TThing[]> => {
        const [_key, slug] = queryKey
        const response = await fetch(
          `/api/campaigns/${slug}/things?count=${count}`
        )
        return response.json()
      },
    })

  const thingQuery = (thingSlug: string) =>
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

  const createThing = useSyncMutation({
    mutationFn: async ({
      newThing,
    }: {
      newThing: { name: string; typeId: number }
    }) => {
      await fetch(`/api/campaigns/${campaignSlug}/things`, {
        method: 'POST',
        body: JSON.stringify({ newThing }),
        headers: { 'Content-Type': 'application/json' },
      })

      posthog?.capture('thing_created', {
        name: newThing.name,
        typeId: newThing.typeId,
        campaignSlug,
      })
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
    }: {
      updatedThing: {
        slug: string
        name?: string
        typeId?: number
        description?: any
      }
    }) => {
      await fetch(
        `/api/campaigns/${campaignSlug}/things/${updatedThing.slug}`,
        {
          method: 'PUT',
          body: JSON.stringify({ updatedThing }),
          headers: { 'Content-Type': 'application/json' },
        }
      )

      posthog?.capture('thing_modified', {
        thingSlug: updatedThing.slug,
        campaignSlug,
      })
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
    createThingsQuery,
    thingQuery,
    createThing,
    deleteThing,
    modifyThing,
  }
}
