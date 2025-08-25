import type { thingType } from '@/lib/db/schema'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { usePostHog } from 'posthog-js/react'
import { useSyncMutation } from './useSyncMutation'

export type TThingType = typeof thingType.$inferSelect

export function useThingTypeQueries() {
  const posthog = usePostHog()
  const queryClient = useQueryClient()

  const createThingTypesQuery = (campaignSlug: string) =>
    useQuery({
      queryKey: ['thingTypes', campaignSlug],
      queryFn: async ({ queryKey }): Promise<TThingType[]> => {
        const [_key, slug] = queryKey
        const response = await fetch(`/api/campaigns/${slug}/thing-types`)
        return response.json()
      },
    })

  const createThingTypeQuery = (campaignSlug: string, thingTypeId: number) =>
    useQuery({
      queryKey: ['thingType', campaignSlug, thingTypeId],
      queryFn: async ({ queryKey }): Promise<TThingType> => {
        const [_key, campaignSlug, thingTypeId] = queryKey
        const response = await fetch(
          `/api/campaigns/${campaignSlug}/thing-types/${thingTypeId}`
        )
        return response.json()
      },
    })

  const createThingType = useSyncMutation({
    mutationFn: async ({
      campaignSlug,
      newThingType,
    }: {
      campaignSlug: string
      newThingType: { name: string }
    }) => {
      await fetch(`/api/campaigns/${campaignSlug}/thing-types`, {
        method: 'POST',
        body: JSON.stringify({ newThingType }),
        headers: { 'Content-Type': 'application/json' },
      })

      posthog?.capture('thing_type_created', {
        name: newThingType.name,
        campaignSlug,
      })
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['thingTypes', variables.campaignSlug],
      })
    },
  })

  const deleteThingType = useSyncMutation({
    mutationFn: async ({
      campaignSlug,
      thingTypeId,
    }: {
      campaignSlug: string
      thingTypeId: number
    }) => {
      await fetch(`/api/campaigns/${campaignSlug}/thing-types/${thingTypeId}`, {
        method: 'DELETE',
      })

      posthog?.capture('thing_type_deleted', {
        thingTypeId,
        campaignSlug,
      })
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['thingTypes', variables.campaignSlug],
      })
      // Also invalidate things since they might be affected
      queryClient.invalidateQueries({
        queryKey: ['things', variables.campaignSlug],
      })
    },
  })

  const modifyThingType = useSyncMutation({
    mutationFn: async ({
      campaignSlug,
      updatedThingType,
    }: {
      campaignSlug: string
      updatedThingType: {
        id: number
        name: string
      }
    }) => {
      await fetch(
        `/api/campaigns/${campaignSlug}/thing-types/${updatedThingType.id}`,
        {
          method: 'PUT',
          body: JSON.stringify({ updatedThingType }),
          headers: { 'Content-Type': 'application/json' },
        }
      )

      posthog?.capture('thing_type_modified', {
        thingTypeId: updatedThingType.id,
        campaignSlug,
      })
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['thingTypes', variables.campaignSlug],
      })
      queryClient.invalidateQueries({
        queryKey: [
          'thingType',
          variables.campaignSlug,
          variables.updatedThingType.id,
        ],
      })
    },
  })

  return {
    createThingTypesQuery,
    createThingTypeQuery,
    createThingType,
    deleteThingType,
    modifyThingType,
  }
}
