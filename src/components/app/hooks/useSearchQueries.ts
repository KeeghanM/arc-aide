import type { FuzzySearchResult } from '@db/search'
import { useAppStore } from '@stores/appStore'
import { useQuery } from '@tanstack/react-query'
import { usePostHog } from 'posthog-js/react'

/**
 * Search Data Management Hook
 *
 * Provides search functionality with fuzzy matching and spell correction.
 * Always uses fuzzy search for better user experience. Tracks search
 * analytics to understand user behavior and improve content discoverability.
 */
export function useSearchQueries() {
  const posthog = usePostHog()
  const { campaignSlug } = useAppStore()

  /**
   * Search query factory for campaign content
   *
   * Features:
   * - Fuzzy search enabled by default for typo tolerance
   * - URL encoding for special characters in search terms
   * - Analytics tracking for search behavior insights
   * - Only executes when search term is provided (enabled: searchTerm.length > 0)
   */
  const useSearchQuery = (searchTerm: string, type = 'any') =>
    useQuery({
      queryKey: ['search', campaignSlug, searchTerm],
      queryFn: async (): Promise<FuzzySearchResult[]> => {
        const response = await fetch(
          `/api/campaigns/${campaignSlug}/search?query=${encodeURIComponent(
            searchTerm
          )}&type=${type}&fuzzy=true`
        )

        // Track search analytics for content optimization
        posthog?.capture('search_performed', {
          campaignSlug,
          searchTerm,
        })

        return response.json()
      },
      enabled: searchTerm.length > 0, // Only search with actual input
    })

  return { useSearchQuery }
}
