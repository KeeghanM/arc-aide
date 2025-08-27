import { auth } from '@auth/auth'
import type { TArc } from '@components/app/hooks/useArcQueries'
import { db } from '@db/db'
import { arc, arcThing, campaign, thing } from '@db/schema'
import Honeybadger from '@honeybadger-io/js'
import { slugify } from '@utils/string'
import type { APIRoute } from 'astro'
import { and, desc, eq } from 'drizzle-orm'
import * as z from 'zod'

/**
 * GET /api/campaigns/[campaignSlug]/arcs
 * Retrieves all arcs for a specific campaign
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

    const { campaignSlug } = params

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

    const result = await db
      .select()
      .from(arc)
      .leftJoin(arcThing, eq(arc.id, arcThing.arcId))
      .leftJoin(thing, eq(arcThing.thingId, thing.id))
      .where(eq(arc.campaignId, campaignResult[0].id))
      .orderBy(desc(arc.createdAt))

    const arcsMap: Record<number, TArc> = {}
    result.forEach((row) => {
      const arcData = row.arc
      const arcThingData = row.thing
      if (!arcsMap[arcData.id]) {
        arcsMap[arcData.id] = {
          ...arcData,
          things: [],
          childArcs: [],
        }
      }
      if (arcThingData) {
        arcsMap[arcData.id].things?.push(arcThingData)
      }
    })

    const arcs = Object.values(arcsMap)

    return new Response(JSON.stringify(arcs), { status: 200 })
  } catch (error) {
    console.error('Error fetching arcs:', error)
    Honeybadger.notify(error as Error)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    })
  }
}

/**
 * POST /api/campaigns/[campaignSlug]/arcs
 * Creates a new arc within a specific campaign
 *
 * @param request.body.newArc - Arc data
 * @param request.body.newArc.name - Arc name (1-255 characters)
 *
 * @example
 * ```json
 * {
 *   "newArc": {
 *     "name": "The Goblin Ambush"
 *   }
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

    const { campaignSlug } = params

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

    const NewArc = z.object({
      name: z.string().min(1).max(255),
    })

    const { newArc } = await request.json()
    const parsedArc = NewArc.safeParse(newArc)

    if (!parsedArc.success) {
      return new Response(JSON.stringify({ error: 'Invalid arc data' }), {
        status: 400,
      })
    }

    const now = new Date()
    const result = await db
      .insert(arc)
      .values({
        slug: slugify(parsedArc.data.name),
        name: parsedArc.data.name,
        campaignId: campaignResult[0].id,
        createdAt: now,
        updatedAt: now,
      })
      .returning()

    return new Response(JSON.stringify(result[0]), { status: 201 })
  } catch (error) {
    console.error('Error creating arc:', error)
    Honeybadger.notify(error as Error)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    })
  }
}
