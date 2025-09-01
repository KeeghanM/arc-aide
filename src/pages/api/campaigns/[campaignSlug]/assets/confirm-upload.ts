import { auth } from '@lib/auth/auth'
import { db } from '@lib/db/db'
import { asset, campaign } from '@lib/db/schema'
import { killBillClient } from '@lib/killbill/client'
import type { APIRoute } from 'astro'
import {
  CLOUDFLARE_ACCOUNT_ID,
  CLOUDFLARE_IMAGES_TOKEN,
} from 'astro:env/server'
import { and, eq } from 'drizzle-orm'

export const POST: APIRoute = async ({ request, params }) => {
  try {
    // Get user session
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { campaignSlug } = params
    if (!campaignSlug) {
      return new Response('Campaign slug is required', { status: 400 })
    }

    // First verify the campaign exists and belongs to the user
    const campaignResult = await db
      .select({ id: campaign.id })
      .from(campaign)
      .where(
        and(
          eq(campaign.slug, campaignSlug as string),
          eq(campaign.userId, session.user.id)
        )
      )

    if (campaignResult.length === 0) {
      return new Response(JSON.stringify({ error: 'Campaign not found' }), {
        status: 404,
      })
    }

    const { imageId, label } = await request.json()
    if (!imageId || !label) {
      return new Response('Image ID and label are required', { status: 400 })
    }

    // Check that the user has a premium subscription
    const subscriptionStatus = await killBillClient.getSubscriptionStatus(
      session.user.id
    )

    if (!subscriptionStatus || !subscriptionStatus.hasActiveSubscription) {
      return new Response('Forbidden: Premium subscription required', {
        status: 403,
      })
    }

    // Check if the image was successfully uploaded to Cloudflare
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v1/${imageId}`,
      {
        headers: {
          Authorization: `Bearer ${CLOUDFLARE_IMAGES_TOKEN}`,
        },
      }
    )

    if (!response.ok) {
      return new Response('Failed to verify image upload', { status: 500 })
    }

    const data = await response.json()
    if (!data.success || data.result.draft) {
      return new Response('Image upload not completed', { status: 400 })
    }

    // Get the public URL (assuming you have a 'public' variant)
    const publicUrl = data.result.variants.find((url: string) =>
      url.includes('/public')
    )
    if (!publicUrl) {
      return new Response('No public variant found', { status: 500 })
    }

    // Save asset to database
    const [savedAsset] = await db
      .insert(asset)
      .values({
        label,
        cloudflareId: imageId,
        url: publicUrl,
        campaignId: campaignResult[0].id,
        userId: session.user.id,
        createdAt: new Date(),
      })
      .returning()

    return new Response(
      JSON.stringify({
        id: savedAsset.id,
        label: savedAsset.label,
        url: savedAsset.url,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Asset confirmation error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
