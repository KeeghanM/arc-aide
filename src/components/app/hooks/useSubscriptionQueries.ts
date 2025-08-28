import type { SubscriptionStatus } from '@lib/killbill/client'
import { createFeatureManager } from '@lib/killbill/features'
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

export interface CreateCheckoutRequest {
  action: 'create_checkout'
  tier: string
}

export interface CreateCheckoutResponse {
  sessionId: string
  accountId: string
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
      if (!response.ok) {
        throw new Error(
          `Failed to fetch subscription status: ${response.status}`
        )
      }
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  })

  // --- Mutations ---
  const createCheckout = useSyncMutation(
    {
      mutationFn: async (
        data: CreateCheckoutRequest
      ): Promise<CreateCheckoutResponse> => {
        const response = await fetch('/api/account/subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          throw new Error(`Failed to create checkout: ${response.status}`)
        }

        return response.json()
      },
      onSuccess: (data, variables) => {
        posthog?.capture('subscription_checkout_created', {
          tier: variables.tier,
          sessionId: data.sessionId,
        })
      },
      onError: (error, variables) => {
        posthog?.capture('subscription_checkout_failed', {
          tier: variables.tier,
          error: error.message,
        })
      },
    },
    queryClient
  )

  // --- Helper functions ---
  const refreshSubscriptionStatus = () => {
    queryClient.invalidateQueries({ queryKey: ['subscription-status'] })
  }

  const startCheckout = async (tier: string) => {
    try {
      const result = await createCheckout.mutateAsync({
        action: 'create_checkout',
        tier,
      })
      if (window.Stripe && PUBLIC_STRIPE_PUBLISHABLE_KEY) {
        const stripe = window.Stripe(PUBLIC_STRIPE_PUBLISHABLE_KEY)
        await stripe.redirectToCheckout({ sessionId: result.sessionId })
      } else {
        throw new Error('Stripe not loaded or publishable key missing')
      }

      return result
    } catch (error) {
      console.error('Checkout error:', error)
      throw error
    }
  }

  return {
    // Queries
    subscriptionStatus: subscriptionStatusQuery.data,
    isLoadingStatus: subscriptionStatusQuery.isLoading,
    statusError: subscriptionStatusQuery.error,

    // Mutations
    createCheckout,
    isCreatingCheckout: createCheckout.isPending,

    // Helper functions
    refreshSubscriptionStatus,
    startCheckout,

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
