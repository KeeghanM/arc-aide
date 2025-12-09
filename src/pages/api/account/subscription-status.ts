import { auth } from '@auth/auth'
import { killBillClient } from '@lib/killbill/client'
import type { APIRoute } from 'astro'

export const GET: APIRoute = async ({ request }) => {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const subscriptionStatus =
      import.meta.env.NODE_ENV === 'production'
        ? await killBillClient.getSubscriptionStatus(session.user.id)
        : {
            hasActiveSubscription: true,
            baseTier: 'free',
            activeAddons: [],
            isTrialActive: false,
            features: {
              hasPremium: true,
              hasPublishing: true,
              hasAI: true,
            },
          }

    return new Response(JSON.stringify(subscriptionStatus), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Subscription status API error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
