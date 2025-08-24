import type { SearchResult } from '@/lib/db/search'
import { useQuery } from '@tanstack/react-query'
import { usePostHog } from 'posthog-js/react'
import { useAppStore } from '../stores/appStore'

export function useSearchQueries() {
  const posthog = usePostHog()

  const { campaignSlug } = useAppStore()

  const searchQuery = (searchTerm: string, type = 'any') =>
    useQuery({
      queryKey: ['search', campaignSlug, searchTerm],
      queryFn: async (): Promise<
        Array<SearchResult & { highlight: string }>
      > => {
        const response = await fetch(
          `/api/campaigns/${campaignSlug}/search?query=${encodeURIComponent(
            searchTerm
          )}&type=${type}`
        )
        posthog?.capture('search_performed', {
          campaignSlug,
          searchTerm,
        })
        return response.json()
      },
      enabled: searchTerm.length > 0,
    })

  return { searchQuery }
}
