import { Button } from '@components/ui/button'
import { Card } from '@components/ui/card'
import { useSubscriptionQueries } from '@hooks/useSubscriptionQueries'
import { CheckCircle, CircleX } from 'lucide-react'
import ScreenWrapper, { type TScreenWrapperProps } from '../../screen-wrapper'

function Manager() {
  const {
    subscriptionStatusQuery,
    upgradeToPremium,
    cancelPremium,
    addPublishingAddon,
    cancelPublishingAddon,
    addAiAddon,
    cancelAiAddon,
    baseTier,
    activeAddons,
    features,
    hasActiveSubscription,
  } = useSubscriptionQueries()

  if (subscriptionStatusQuery.isLoading) {
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

  if (subscriptionStatusQuery.isError) {
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

  if (
    upgradeToPremium.isError ||
    addPublishingAddon.isError ||
    addAiAddon.isError
  ) {
    return (
      <div className='space-y-6'>
        <div>
          <h2 className='text-2xl font-bold'>Subscription Management</h2>
          <p className='text-red-600'>
            Something went wrong. Please try again later.
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
          </div>

          {/* Base Plan Upgrade */}
          {baseTier === 'free' && (
            <div className='space-y-3'>
              <h4 className='font-medium'>Upgrade Base Plan</h4>
              <Button
                onClick={() => upgradeToPremium.mutate()}
                disabled={upgradeToPremium.isPending}
                className='justify-start'
              >
                {upgradeToPremium.isPending
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
                {!features.hasPublishing && (
                  <Button
                    onClick={() => addPublishingAddon.mutate()}
                    disabled={addPublishingAddon.isPending}
                    className='justify-start'
                  >
                    {addPublishingAddon.isPending
                      ? 'Adding...'
                      : 'Add Publishing Tools - $2/month'}
                  </Button>
                )}
                {!features.hasAI && (
                  <Button
                    onClick={() => addAiAddon.mutate()}
                    disabled={addAiAddon.isPending}
                    className='justify-start'
                  >
                    {addAiAddon.isPending
                      ? 'Adding...'
                      : 'Add AI-Powered Features - $5/month'}
                  </Button>
                )}
                {features.hasPublishing && features.hasAI && (
                  <p className='text-muted-foreground'>
                    You have all available add-ons.
                  </p>
                )}
              </div>
              {hasActiveSubscription &&
                !(features.hasPublishing && features.hasAI) && (
                  <p className='text-muted-foreground text-xs'>
                    Features will be added to your existing subscription
                    immediately.
                  </p>
                )}
            </div>
          )}

          {/* Feature Summary */}
          <div className='grid grid-cols-1 md:grid-cols-2'>
            <div className='space-y-2'>
              <h4 className='font-medium'>Your Features</h4>
              <div className='grid gap-2 text-sm'>
                <div
                  className={`flex items-center gap-2 ${features.hasPremium ? 'text-green-600' : 'text-muted-foreground'}`}
                >
                  {features.hasPremium ? <CheckCircle /> : <CircleX />} Premium
                  Features
                  {features.hasPremium && (
                    <Button
                      variant='link'
                      size='sm'
                      className='m-0 ml-auto p-0 text-red-500'
                      onClick={() => cancelPremium.mutate()}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
                <div
                  className={`flex items-center gap-2 ${features.hasPublishing ? 'text-green-600' : 'text-muted-foreground'}`}
                >
                  {features.hasPublishing ? <CheckCircle /> : <CircleX />}{' '}
                  Publishing Tools
                  {features.hasPublishing && (
                    <Button
                      variant='link'
                      size='sm'
                      className='m-0 ml-auto p-0 text-red-500'
                      onClick={() => cancelPublishingAddon.mutate()}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
                <div
                  className={`flex items-center gap-2 ${features.hasAI ? 'text-green-600' : 'text-muted-foreground'}`}
                >
                  {features.hasAI ? <CheckCircle /> : <CircleX />} AI-Powered
                  Features
                  {features.hasAI && (
                    <Button
                      variant='link'
                      size='sm'
                      className='m-0 ml-auto p-0 text-red-500'
                      onClick={() => cancelAiAddon.mutate()}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
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
