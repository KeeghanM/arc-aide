import { auth } from '@auth/auth'
import { killBillClient } from '@lib/killbill/client'
import type { APIRoute } from 'astro'

export const POST: APIRoute = async ({ request }) => {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { sessionId, kbAccountId } = await request.json()

    if (!sessionId || !kbAccountId) {
      return new Response('Missing required parameters', { status: 400 })
    }

    // Get the account from KillBill
    const account = await killBillClient.findAccountByExternalKey(
      session.user.id
    )
    if (!account || account.accountId !== kbAccountId) {
      return new Response('Account mismatch', { status: 400 })
    }

    // Check subscription status first
    const subscriptionStatus = await killBillClient.getSubscriptionStatus(
      session.user.id
    )

    if (subscriptionStatus.hasActiveSubscription) {
      return new Response(
        JSON.stringify({ message: 'Subscription already active' }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Complete the charge using KillBill (following Ruby example)
    const result = await killBillClient.charge(kbAccountId, sessionId)

    return new Response(
      JSON.stringify({
        message: 'Subscription activated successfully',
        accountId: account.accountId,
        subscriptionId: result.subscription.subscriptionId,
        invoiceId: result.invoice?.invoiceId,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Subscription completion error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
