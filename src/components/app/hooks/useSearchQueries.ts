import type { FuzzySearchResult } from '@db/search'
import { useAppStore } from '@stores/appStore'
import { useQuery } from '@tanstack/react-query'
import { usePostHog } from 'posthog-js/react'

export function useSearchQueries() {
  const posthog = usePostHog()

  const { campaignSlug } = useAppStore()

  const useSearchQuery = (searchTerm: string, type = 'any') =>
    useQuery({
      queryKey: ['search', campaignSlug, searchTerm],
      queryFn: async (): Promise<FuzzySearchResult[]> => {
        const response = await fetch(
          `/api/campaigns/${campaignSlug}/search?query=${encodeURIComponent(
            searchTerm
          )}&type=${type}&fuzzy=true`
        )
        posthog?.capture('search_performed', {
          campaignSlug,
          searchTerm,
        })
        return response.json()
      },
      enabled: searchTerm.length > 0,
    })

  return { useSearchQuery }
}
