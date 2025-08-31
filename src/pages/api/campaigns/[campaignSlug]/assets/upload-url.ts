import { auth } from '@lib/auth/auth'
import { db } from '@lib/db/db'
import { campaign } from '@lib/db/schema'
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

    const { label } = await request.json()
    if (!label) {
      return new Response('Label is required', { status: 400 })
    }

    // Request one-time upload URL from Cloudflare
    const formData = new FormData()
    formData.append('requireSignedURLs', 'true')
    formData.append(
      'metadata',
      JSON.stringify({
        label,
        campaignId: campaignResult[0].id.toString(),
        userId: session.user.id,
      })
    )

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v2/direct_upload`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${CLOUDFLARE_IMAGES_TOKEN}`,
        },
        body: formData,
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('Cloudflare upload URL request failed:', error)
      return new Response('Failed to generate upload URL', { status: 500 })
    }

    const data = await response.json()

    if (!data.success) {
      console.error('Cloudflare API error:', data.errors)
      return new Response('Failed to generate upload URL', { status: 500 })
    }

    return new Response(
      JSON.stringify({
        uploadUrl: data.result.uploadURL,
        imageId: data.result.id,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Upload URL generation error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
