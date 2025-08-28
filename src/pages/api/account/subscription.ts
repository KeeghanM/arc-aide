import { auth } from '@auth/auth'
import { killBillClient } from '@lib/killbill/client'
import type { APIRoute } from 'astro'

export const POST: APIRoute = async ({ request }) => {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { action, tier: _tier } = await request.json()

    if (action === 'create_checkout') {
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
