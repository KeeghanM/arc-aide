import { auth } from '@auth/auth'
import { killBillClient, type TPlanId } from '@lib/killbill/client'
import type { APIRoute } from 'astro'

export const POST: APIRoute = async ({ request }) => {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { addonId }: { addonId: TPlanId } = await request.json()

    if (!addonId) {
      return new Response('Missing addon ID', { status: 400 })
    }

    // Verify the addon is one we support
    if (!['ai-monthly', 'publishing-monthly'].includes(addonId)) {
      return new Response('Invalid addon ID', { status: 400 })
    }

    // Get the user's KillBill account
    const account = await killBillClient.findAccountByExternalKey(
      session.user.id
    )
    if (!account) {
      return new Response('No KillBill account found', { status: 404 })
    }

    // Check current subscription status
    const subscriptionStatus = await killBillClient.getSubscriptionStatus(
      session.user.id
    )

    // User must have an active premium subscription to add add-ons
    if (!subscriptionStatus.hasActiveSubscription) {
      return new Response(
        'Must have active premium subscription to add add-ons',
        {
          status: 400,
        }
      )
    }

    // Check if they already have this add-on
    if (
      (addonId === 'ai-monthly' && subscriptionStatus.features.hasAI) ||
      (addonId === 'publishing-monthly' &&
        subscriptionStatus.features.hasPublishing)
    ) {
      return new Response('Already has addon', {
        status: 400,
      })
    }

    // Add the add-on subscription
    const newAddonSubscription = await killBillClient.addAddonToSubscription(
      account.accountId,
      addonId
    )

    return new Response(
      JSON.stringify({
        success: true,
        subscription: {
          subscriptionId: newAddonSubscription.subscriptionId,
          productName: newAddonSubscription.productName,
          state: newAddonSubscription.state,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Add-on creation error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Failed to add add-on. Please try again.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { addonId }: { addonId: TPlanId } = await request.json()

    if (!addonId) {
      return new Response('Missing addon ID', { status: 400 })
    }

    // Verify the addon is one we support
    if (!['ai-monthly', 'publishing-monthly'].includes(addonId)) {
      return new Response('Invalid addon ID', { status: 400 })
    }

    // Cancel the specific add-on subscription
    await killBillClient.cancelSubscriptionByType(session.user.id, addonId)

    return new Response(
      JSON.stringify({
        success: true,
        message: `${addonId.replace('-monthly', '')} add-on canceled successfully`,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Add-on cancellation error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Failed to cancel add-on. Please try again.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
