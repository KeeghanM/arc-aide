import { auth } from '@auth/auth'
import { killBillClient } from '@lib/killbill/client'
import type { APIRoute } from 'astro'

export const POST: APIRoute = async ({ request }) => {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { action, tier } = await request.json()

    if (action === 'create_checkout') {
      // Check if user already has a subscription
      const subscriptionStatus = await killBillClient.getSubscriptionStatus(
        session.user.id
      )

      // If user has an active subscription and is trying to add an add-on,
      // suggest using the direct add-on flow instead
      if (
        subscriptionStatus.hasActiveSubscription &&
        subscriptionStatus.baseTier === 'premium' &&
        ['ai-monthly', 'publishing-monthly'].includes(tier)
      ) {
        return new Response(
          JSON.stringify({
            error: 'USE_ADDON_FLOW',
            message:
              'You already have an active subscription. Add-ons can be added directly without checkout.',
            addonId: tier,
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }

      // Find or create Kill Bill account (following Ruby example)
      const kbAccount = await killBillClient.findOrCreateAccount(
        session.user.id,
        session.user.name || 'User',
        session.user.email
      )

      // Create Stripe session using KillBill plugin (following Ruby example)
      const baseUrl = new URL(request.url).origin
      const successUrl = `${baseUrl}/dashboard/account/subscription-success?kbAccountId=${kbAccount.accountId}&sessionId={CHECKOUT_SESSION_ID}`

      const sessionId = await killBillClient.createSession(
        kbAccount.accountId,
        successUrl
      )

      return new Response(
        JSON.stringify({
          sessionId: sessionId,
          accountId: kbAccount.accountId,
        }),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    return new Response('Invalid action', { status: 400 })
  } catch (error) {
    console.error('Subscription API error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
