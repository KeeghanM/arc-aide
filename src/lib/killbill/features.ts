import type { SubscriptionStatus } from './client'

/**
 * Feature Manager
 *
 * Encapsulates feature flag logic based on subscription status.
 * Use these throughout the app to gate features.
 */
export class FeatureManager {
  constructor(private subscriptionStatus: SubscriptionStatus) {}

  // Base plan features
  get hasPremium(): boolean {
    return this.subscriptionStatus.features.hasPremium
  }

  // Add-on features
  get hasPublishing(): boolean {
    return this.subscriptionStatus.features.hasPublishing
  }

  get hasAi(): boolean {
    return this.subscriptionStatus.features.hasAI
  }

  // Check multiple features at once
  hasAnyOf(features: ('premium' | 'publishing' | 'ai')[]): boolean {
    return features.some((feature) => {
      switch (feature) {
        case 'premium':
          return this.hasPremium
        case 'publishing':
          return this.hasPublishing
        case 'ai':
          return this.hasAi
        default:
          return false
      }
    })
  }

  hasAllOf(features: ('premium' | 'publishing' | 'ai')[]): boolean {
    return features.every((feature) => {
      switch (feature) {
        case 'premium':
          return this.hasPremium
        case 'publishing':
          return this.hasPublishing
        case 'ai':
          return this.hasAi
        default:
          return false
      }
    })
  }

  // Get missing features for upgrade prompts
  getMissingFeatures(
    requiredFeatures: ('premium' | 'publishing' | 'ai')[]
  ): string[] {
    return requiredFeatures.filter((feature) => {
      switch (feature) {
        case 'premium':
          return !this.hasPremium
        case 'publishing':
          return !this.hasPublishing
        case 'ai':
          return !this.hasAi
        default:
          return true
      }
    })
  }
}

/**
 * Helper hook to use feature checking in React components
 */
export function createFeatureManager(
  subscriptionStatus: SubscriptionStatus | undefined
): FeatureManager | null {
  if (!subscriptionStatus) return null
  return new FeatureManager(subscriptionStatus)
}
