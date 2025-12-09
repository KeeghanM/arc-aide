import { AccountSettings } from '../components/account/account-settings'
import { SubscriptionManager } from '../components/account/subscription-manager'
import { ScreenWrapper, type TScreenWrapperProps } from '../screen-wrapper'

type TAccountProps = {}

/**
 * Account Settings Screen Component
 *
 * Provides user account management including:
 * - Profile information (name, username, display name)
 * - Subscription management
 * - User preferences
 *
 * Wrapped with ScreenWrapper to provide React Query context.
 */
export function AccountScreen({
  user,
  campaignSlug,
}: TAccountProps & TScreenWrapperProps) {
  return (
    <ScreenWrapper
      user={user}
      campaignSlug={campaignSlug}
    >
      <div className='container mx-auto py-8'>
        <div className='mx-auto max-w-4xl space-y-8'>
          <h1 className='mb-6 text-3xl font-bold'>Account Settings</h1>

          {/* Account Info */}
          <section>
            <AccountSettings />
          </section>

          {/* Subscription Management */}
          <section>
            <SubscriptionManager
              user={user}
              campaignSlug={campaignSlug}
            />
          </section>
        </div>
      </div>
    </ScreenWrapper>
  )
}
