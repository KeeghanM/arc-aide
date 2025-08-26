import { auth } from '@auth/auth'
import { db } from '@db/db'
import { arc, campaign } from '@db/schema'
import Honeybadger from '@honeybadger-io/js'
import type { APIRoute } from 'astro'
import { and, eq } from 'drizzle-orm'
import * as z from 'zod'

/**
 * GET /api/campaigns/[campaignSlug]/arcs/by-id/[arcId]
 * Retrieves a specific arc within a campaign by its ID
 */
export const GET: APIRoute = async ({ request, params }) => {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      })
    }

    const { campaignSlug, arcId } = params

    if (
      !arcId ||
      !campaignSlug ||
      !z.number().parse(Number(arcId)) ||
      !z.string().parse(campaignSlug)
    ) {
      return new Response(JSON.stringify({ error: 'Invalid parameters' }), {
        status: 400,
      })
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
      console.log('Campaign not found for slug:', campaignSlug)
      return new Response(JSON.stringify({ error: 'Campaign not found' }), {
        status: 404,
      })
    }

    const arcResult = await db
      .select()
      .from(arc)
      .where(
        and(eq(arc.id, Number(arcId)), eq(arc.campaignId, campaignResult[0].id))
      )

    if (arcResult.length === 0) {
      console.log('Arc not found for ID:', arcId)
      return new Response(JSON.stringify({ error: 'Arc not found' }), {
        status: 404,
      })
    }

    return new Response(JSON.stringify(arcResult[0]), { status: 200 })
  } catch (error) {
    console.error('Error fetching arc:', error)
    Honeybadger.notify(error as Error)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    })
  }
}
