import type { SubscriptionStatus } from '@lib/killbill/client'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { PUBLIC_STRIPE_PUBLISHABLE_KEY } from 'astro:env/client'
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

        const result = await response.json()

        // The subscription endpoint gives us a Stripe SessionID
        // Which we now need to manually redirect the user to
        if (window.Stripe && PUBLIC_STRIPE_PUBLISHABLE_KEY) {
          const stripe = window.Stripe(PUBLIC_STRIPE_PUBLISHABLE_KEY)
          await stripe.redirectToCheckout({ sessionId: result.sessionId })
        } else {
          throw new Error('Stripe not loaded or publishable key missing')
        }

        return result
      },
      onSuccess: (data) => {
        posthog?.capture('subscription_checkout_created', {
          tier: 'premium-monthly',
          sessionId: data.sessionId,
        })
        queryClient.invalidateQueries({ queryKey: ['subscription-status'] })
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

  const cancelPremium = useSyncMutation(
    {
      mutationFn: async (): Promise<{ success: boolean; message?: string }> => {
        const response = await fetch('/api/account/subscription', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        })

        return response.json()
      },
      onSuccess: (data) => {
        posthog?.capture('subscription_cancelled', {
          success: data.success,
        })
        queryClient.invalidateQueries({ queryKey: ['subscription-status'] })
      },
      onError: (error) => {
        posthog?.capture('subscription_cancel_failed', {
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

  const cancelPublishingAddon = useSyncMutation(
    {
      mutationFn: async (): Promise<{ success: boolean; message?: string }> => {
        const response = await fetch('/api/account/subscription-addon', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ addonId: 'publishing-monthly' }),
        })

        return response.json()
      },
      onSuccess: (data) => {
        posthog?.capture('subscription_addon_cancelled', {
          addonId: 'publishing-monthly',
          success: data.success,
        })
        queryClient.invalidateQueries({ queryKey: ['subscription-status'] })
      },
      onError: (error) => {
        posthog?.capture('subscription_addon_cancel_failed', {
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

  const cancelAiAddon = useSyncMutation(
    {
      mutationFn: async (): Promise<{ success: boolean; message?: string }> => {
        const response = await fetch('/api/account/subscription-addon', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ addonId: 'ai-monthly' }),
        })

        return response.json()
      },
      onSuccess: (data) => {
        posthog?.capture('subscription_addon_cancelled', {
          addonId: 'ai-monthly',
          success: data.success,
        })
        queryClient.invalidateQueries({ queryKey: ['subscription-status'] })
      },
      onError: (error) => {
        posthog?.capture('subscription_addon_cancel_failed', {
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
    cancelPremium,
    addPublishingAddon,
    cancelPublishingAddon,
    addAiAddon,
    cancelAiAddon,

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
  }
}
