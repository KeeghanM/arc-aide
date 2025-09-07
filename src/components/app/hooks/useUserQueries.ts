import { authClient } from '@lib/auth/client-react'
import { useAppStore } from '@stores/appStore'
import { useQueryClient } from '@tanstack/react-query'
import { usePostHog } from 'posthog-js/react'

import { useSyncMutation } from './useSyncMutation'

export type TUserProfileUpdate = {
  name?: string
  username?: string
  displayUsername?: string
}

/**
 * User Profile Management Hook
 *
 * Provides profile update operations with React Query caching,
 * PostHog analytics tracking, and local state synchronization.
 * Handles username availability checking and profile updates.
 */
export function useUserQueries() {
  const posthog = usePostHog()
  const queryClient = useQueryClient()
  const { user, setUser } = useAppStore()

  // --- Username availability check ---
  const checkUsernameAvailability = useSyncMutation({
    mutationFn: async (username: string) => {
      const { data: response, error } = await authClient.isUsernameAvailable({
        username,
      })

      if (error) {
        throw new Error('Failed to check username availability')
      }

      if (!response?.available) {
        throw new Error(
          'Username is not available. Please choose a different one.'
        )
      }

      return response
    },
  })

  // --- Profile update mutation ---
  const updateProfile = useSyncMutation({
    mutationFn: async (profileData: TUserProfileUpdate) => {
      // Check username availability if username is being changed
      if (profileData.username && profileData.username !== user?.username) {
        const { data: response, error } = await authClient.isUsernameAvailable({
          username: profileData.username,
        })

        if (error) {
          throw new Error('Failed to check username availability')
        }

        if (!response?.available) {
          throw new Error(
            'Username is not available. Please choose a different one.'
          )
        }
      }

      // Update user profile
      const result = await authClient.updateUser({
        name: profileData.name,
        username: profileData.username || undefined,
        displayUsername:
          profileData.displayUsername ||
          profileData.username ||
          profileData.name,
      })

      if (result.error) {
        throw new Error(result.error.message || 'Failed to update profile')
      }

      // Track the update
      posthog?.capture('profile_updated', {
        hasUsername: !!profileData.username,
        hasDisplayUsername: !!profileData.displayUsername,
      })

      return result.data
    },
    onSuccess: (data, variables) => {
      // Update local user state
      if (user && data) {
        setUser({
          ...user,
          name: variables.name || user.name,
          username: variables.username || user.username,
          displayUsername:
            variables.displayUsername ||
            variables.username ||
            variables.name ||
            user.displayUsername,
        })
      }

      // Invalidate any user-related queries if they exist
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
  })

  // --- Username setup mutation (for first-time setup) ---
  const setupUsername = useSyncMutation({
    mutationFn: async (data: {
      username: string
      displayUsername?: string
    }) => {
      // Check username availability
      const { data: response, error } = await authClient.isUsernameAvailable({
        username: data.username,
      })

      if (error) {
        throw new Error('Failed to check username availability')
      }

      if (!response?.available) {
        throw new Error(
          'Username is not available. Please choose a different one.'
        )
      }

      // Update user with username
      const result = await authClient.updateUser({
        username: data.username,
        displayUsername: data.displayUsername || data.username,
      })

      if (result.error) {
        throw new Error(result.error.message || 'Failed to set username')
      }

      // Track the setup
      posthog?.capture('username_setup', {
        username: data.username,
        hasDisplayUsername: !!data.displayUsername,
      })

      return result.data
    },
    onSuccess: (data, variables) => {
      // Update local user state
      if (user && data) {
        setUser({
          ...user,
          username: variables.username,
          displayUsername: variables.displayUsername || variables.username,
        })
      }

      // Invalidate any user-related queries if they exist
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
  })

  return {
    checkUsernameAvailability,
    updateProfile,
    setupUsername,
  }
}
