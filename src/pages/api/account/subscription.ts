import { auth } from '@auth/auth'
import { killBillClient } from '@lib/killbill/client'
import type { APIRoute } from 'astro'

export const POST: APIRoute = async ({ request }) => {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { action } = await request.json()

    if (action === 'create_checkout') {
      // Check if user already has a subscription
      const subscriptionStatus = await killBillClient.getSubscriptionStatus(
        session.user.id
      )

      if (subscriptionStatus.hasActiveSubscription) {
        return new Response('Account already subscribed', { status: 400 })
      }

      const kbAccount = await killBillClient.findOrCreateAccount(
        session.user.id,
        session.user.name || 'User',
        session.user.email
      )
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

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    // This automatically also cancels the addons
    await killBillClient.cancelSubscriptionByType(
      session.user.id,
      'premium-monthly'
    )

    return new Response(
      JSON.stringify({
        success: true,
        message: 'All subscriptions canceled successfully',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Subscription cancellation error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Failed to cancel subscription. Please try again.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
