import { Button } from '@components/ui/button'
import { Card } from '@components/ui/card'
import { useSubscriptionQueries } from '@hooks/useSubscriptionQueries'
import { CheckCircle, CircleX } from 'lucide-react'
import ScreenWrapper, { type TScreenWrapperProps } from '../../screen-wrapper'

function Manager() {
  const {
    subscriptionStatus,
    isLoadingStatus,
    statusError,
    isCreatingCheckout,
    startCheckout,
    baseTier,
    activeAddons,
    isTrialActive,
    trialEndsAt,
    features,
  } = useSubscriptionQueries()

  const handleUpgrade = async (tier: string) => {
    try {
      await startCheckout(tier)
    } catch (error) {
      console.error('Upgrade error:', error)
      alert('Failed to start checkout process. Please try again.')
    }
  }

  if (isLoadingStatus) {
    return (
      <div className='space-y-6'>
        <div>
          <h2 className='text-2xl font-bold'>Subscription Management</h2>
          <p className='text-muted-foreground'>
            Loading subscription status...
          </p>
        </div>
      </div>
    )
  }

  if (statusError) {
    return (
      <div className='space-y-6'>
        <div>
          <h2 className='text-2xl font-bold'>Subscription Management</h2>
          <p className='text-red-600'>
            Failed to load subscription status. Please try again later.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold'>Subscription Management</h2>
        <p className='text-muted-foreground'>
          Manage your Arc-Aide subscription
        </p>
      </div>

      <Card className='p-6'>
        <div className='space-y-4'>
          <div>
            <h3 className='font-semibold'>Current Plan</h3>
            <p className='text-muted-foreground text-sm'>
              {baseTier === 'premium' ? 'Premium Plan' : 'Free Plan'}
              {activeAddons.length > 0 && (
                <span>
                  {' '}
                  +{' '}
                  {activeAddons
                    .map(
                      (addon) => addon.charAt(0).toUpperCase() + addon.slice(1)
                    )
                    .join(', ')}{' '}
                  Add-ons
                </span>
              )}
            </p>
            {isTrialActive && trialEndsAt && (
              <p className='text-sm text-orange-600'>
                Trial ends: {new Date(trialEndsAt).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Base Plan Upgrade */}
          {baseTier === 'free' && (
            <div className='space-y-3'>
              <h4 className='font-medium'>Upgrade Base Plan</h4>
              <Button
                onClick={() => handleUpgrade('premium')}
                disabled={isCreatingCheckout}
                className='justify-start'
              >
                {isCreatingCheckout
                  ? 'Loading...'
                  : 'Upgrade to Premium - $5/month'}
              </Button>
            </div>
          )}

          {/* Add-ons Section */}
          {baseTier === 'premium' && (
            <div className='space-y-3'>
              <h4 className='font-medium'>Add Features</h4>
              <div className='grid gap-3 md:grid-cols-2'>
                <Button
                  onClick={() => handleUpgrade('publishing')}
                  disabled={isCreatingCheckout || features.hasPublishing}
                  variant={features.hasPublishing ? 'secondary' : 'outline'}
                  className='justify-start'
                >
                  {features.hasPublishing
                    ? '✓ Publishing Features'
                    : isCreatingCheckout
                      ? 'Loading...'
                      : 'Add Publishing - $2/month'}
                </Button>
                <Button
                  onClick={() => handleUpgrade('ai')}
                  disabled={isCreatingCheckout || features.hasAI}
                  variant={features.hasAI ? 'secondary' : 'outline'}
                  className='justify-start'
                >
                  {features.hasAI
                    ? '✓ AI Features'
                    : isCreatingCheckout
                      ? 'Loading...'
                      : 'Add AI Features - $5/month'}
                </Button>
              </div>
            </div>
          )}

          {/* Feature Summary */}
          <div className='space-y-2'>
            <h4 className='font-medium'>Your Features</h4>
            <div className='grid gap-2 text-sm'>
              <div
                className={`flex items-center gap-2 ${features.hasPremium ? 'text-green-600' : 'text-muted-foreground'}`}
              >
                {features.hasPremium ? <CheckCircle /> : <CircleX />} Premium
                Features
              </div>
              <div
                className={`flex items-center gap-2 ${features.hasPublishing ? 'text-green-600' : 'text-muted-foreground'}`}
              >
                {features.hasPublishing ? <CheckCircle /> : <CircleX />}{' '}
                Publishing Tools
              </div>
              <div
                className={`flex items-center gap-2 ${features.hasAI ? 'text-green-600' : 'text-muted-foreground'}`}
              >
                {features.hasAI ? <CheckCircle /> : <CircleX />} AI-Powered
                Features
              </div>
            </div>
          </div>

          {/* Show active subscriptions */}
          {subscriptionStatus?.subscriptions &&
            subscriptionStatus.subscriptions.length > 0 && (
              <div className='space-y-2'>
                <h4 className='font-medium'>Subscription Details</h4>
                {subscriptionStatus.subscriptions.map((sub, index) => (
                  <div
                    key={index}
                    className='text-muted-foreground text-sm'
                  >
                    {sub.productName} - {sub.state}
                    {sub.phaseType === 'TRIAL' && ' (Trial)'}
                  </div>
                ))}
              </div>
            )}
        </div>
      </Card>
    </div>
  )
}

export function SubscriptionManager({ user }: TScreenWrapperProps) {
  return (
    <ScreenWrapper
      user={user}
      campaignSlug={undefined}
    >
      <Manager />
    </ScreenWrapper>
  )
}
