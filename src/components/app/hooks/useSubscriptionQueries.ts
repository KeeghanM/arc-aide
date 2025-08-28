import type { SubscriptionStatus } from '@lib/killbill/client'
import { createFeatureManager } from '@lib/killbill/features'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { usePostHog } from 'posthog-js/react'
import { useSyncMutation } from './useSyncMutation'

// Declare Stripe type for window
declare global {
  interface Window {
    Stripe?: (key: string) => {
      redirectToCheckout: (options: { sessionId: string }) => Promise<void>
    }
  }
}

export type TUpgradeToPremiumResponse = {
  sessionId: string
  accountId: string
}

export type TAddAddonResponse = {
  success: boolean
  subscription?: {
    subscriptionId: string
    productName: string
    state: string
  }
  message?: string
}

/**
 * Subscription Management Hook
 *
 * Provides subscription status fetching and checkout creation with React Query caching
 * and PostHog analytics tracking. Integrates with Kill Bill for subscription management.
 */
export function useSubscriptionQueries() {
  const posthog = usePostHog()
  const queryClient = useQueryClient()

  // --- Data fetching ---
  const subscriptionStatusQuery = useQuery({
    queryKey: ['subscription-status'],
    queryFn: async (): Promise<SubscriptionStatus> => {
      const response = await fetch('/api/account/subscription-status')

      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  })

  // --- Mutations ---
  const upgradeToPremium = useSyncMutation(
    {
      mutationFn: async (): Promise<TUpgradeToPremiumResponse> => {
        const response = await fetch('/api/account/subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create_checkout',
            tier: 'premium-monthly',
          }),
        })

        return response.json()
      },
      onSuccess: (data) => {
        posthog?.capture('subscription_checkout_created', {
          tier: 'premium-monthly',
          sessionId: data.sessionId,
        })
      },
      onError: (error) => {
        posthog?.capture('subscription_checkout_failed', {
          tier: 'premium-monthly',
          error: error.message,
        })
      },
    },
    queryClient
  )

  const addPublishingAddon = useSyncMutation(
    {
      mutationFn: async (): Promise<TAddAddonResponse> => {
        const response = await fetch('/api/account/subscription-addon', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ addonId: 'publishing-monthly' }),
        })

        return response.json()
      },
      onSuccess: (data) => {
        posthog?.capture('subscription_addon_added', {
          addonId: 'publishing-monthly',
          success: data.success,
        })
        queryClient.invalidateQueries({ queryKey: ['subscription-status'] })
      },
      onError: (error) => {
        posthog?.capture('subscription_addon_failed', {
          addonId: 'publishing-monthly',
          error: error.message,
        })
      },
    },
    queryClient
  )
  const addAiAddon = useSyncMutation(
    {
      mutationFn: async (): Promise<TAddAddonResponse> => {
        const response = await fetch('/api/account/subscription-addon', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ addonId: 'ai-monthly' }),
        })

        return response.json()
      },
      onSuccess: (data) => {
        posthog?.capture('subscription_addon_added', {
          addonId: 'ai-monthly',
          success: data.success,
        })
        queryClient.invalidateQueries({ queryKey: ['subscription-status'] })
      },
      onError: (error) => {
        posthog?.capture('subscription_addon_failed', {
          addonId: 'ai-monthly',
          error: error.message,
        })
      },
    },
    queryClient
  )

  return {
    subscriptionStatusQuery,
    upgradeToPremium,
    addPublishingAddon,
    addAiAddon,

    // Computed values
    hasActiveSubscription:
      subscriptionStatusQuery.data?.hasActiveSubscription ?? false,
    baseTier: subscriptionStatusQuery.data?.baseTier ?? 'free',
    activeAddons: subscriptionStatusQuery.data?.activeAddons ?? [],
    isTrialActive: subscriptionStatusQuery.data?.isTrialActive ?? false,
    trialEndsAt: subscriptionStatusQuery.data?.trialEndsAt,
    features: subscriptionStatusQuery.data?.features ?? {
      hasPremium: false,
      hasPublishing: false,
      hasAI: false,
    },

    // Feature manager for easy feature checking
    featureManager: createFeatureManager(subscriptionStatusQuery.data),
  }
}
