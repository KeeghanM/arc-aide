import Honeybadger from '@honeybadger-io/js'
import { auth } from '@lib/auth/auth'
import { db } from '@lib/db/db'
import { arc, arcThing, campaign, thing } from '@lib/db/schema'
import type { APIRoute } from 'astro'
import { and, eq } from 'drizzle-orm'

/**
 * GET /api/campaigns/[campaignSlug]/things/[thingSlug]/arcs
 * Retrieves all arcs that include a specific Thing within a campaign
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

    const { campaignSlug, thingSlug } = params

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

    const thingResult = await db
      .select()
      .from(thing)
      .where(
        and(
          eq(thing.slug, thingSlug as string),
          eq(thing.campaignId, campaignResult[0].id)
        )
      )

    if (thingResult.length === 0) {
      return new Response(JSON.stringify({ error: 'Thing not found' }), {
        status: 404,
      })
    }

    // Now we can fetch all arcs that include this thing
    const arcsWithThing = await db
      .select({ arc })
      .from(arc)
      .fullJoin(arcThing, eq(arc.id, arcThing.arcId))
      .where(
        and(
          eq(arcThing.thingId, thingResult[0].id),
          eq(arc.campaignId, campaignResult[0].id)
        )
      )

    return new Response(JSON.stringify(arcsWithThing.map((a) => a.arc)), {
      status: 200,
    })
  } catch (error) {
    console.error('Error fetching arcs with thing:', error)
    Honeybadger.notify(error as Error)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    })
  }
}

/**
 * POST /api/campaigns/[campaignSlug]/things/[thingSlug]/arcs
 * Associates a thing with an arc within a specific campaign
 * @param request.body.arcSlug - The slug of the arc to associate with the thing
 *
 * We only need the arcSlug because we can derive the thingId from the URL params
 *
 * @example
 * ```json
 * {
 *   "arcSlug": "the-goblin-ambush"
 * }
 * ```
 */
export const POST: APIRoute = async ({ request, params }) => {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      })
    }

    const { campaignSlug, thingSlug } = params
    const { arcSlug } = await request.json()

    if (!arcSlug || typeof arcSlug !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid arcSlug' }), {
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
      return new Response(JSON.stringify({ error: 'Campaign not found' }), {
        status: 404,
      })
    }

    const thingResult = await db
      .select()
      .from(thing)
      .where(
        and(
          eq(thing.slug, thingSlug as string),
          eq(thing.campaignId, campaignResult[0].id)
        )
      )

    if (thingResult.length === 0) {
      return new Response(JSON.stringify({ error: 'Thing not found' }), {
        status: 404,
      })
    }

    const arcResult = await db
      .select()
      .from(arc)
      .where(
        and(
          eq(arc.slug, arcSlug as string),
          eq(arc.campaignId, campaignResult[0].id)
        )
      )

    if (arcResult.length === 0) {
      return new Response(JSON.stringify({ error: 'Arc not found' }), {
        status: 404,
      })
    }

    // Now create the association between the thing and the arc
    await db.insert(arcThing).values({
      arcId: arcResult[0].id,
      thingId: thingResult[0].id,
    })

    return new Response(
      JSON.stringify({ message: 'Thing added to Arc successfully' }),
      { status: 201 }
    )
  } catch (error) {
    console.error('Error adding thing to arc:', error)
    Honeybadger.notify(error as Error)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    })
  }
}
