import { auth } from '@/lib/auth/auth'
import { db } from '@/lib/db/db'
import { arc, campaign } from '@/lib/db/schema'
import Honeybadger from '@honeybadger-io/js'
import { slugify } from '@utils/string'
import type { APIRoute } from 'astro'
import { and, eq } from 'drizzle-orm'
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

    const arcs = await db
      .select()
      .from(arc)
      .where(eq(arc.campaignId, campaignResult[0].id))

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
