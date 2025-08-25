import { auth } from '@/lib/auth/auth'
import { db } from '@/lib/db/db'
import { campaign, thing } from '@/lib/db/schema'
import Honeybadger from '@honeybadger-io/js'
import { slugify } from '@utils/string'
import type { APIRoute } from 'astro'
import { and, desc, eq } from 'drizzle-orm'
import * as z from 'zod'

/**
 * GET /api/campaigns/[campaignSlug]/things
 * Retrieves all things (entities) for a specific campaign
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

    const countParam = new URL(request.url).searchParams.get('count')
    const count = countParam ? parseInt(countParam, 10) : undefined
    const DEFAULT_COUNT = 20

    const things = await db
      .select()
      .from(thing)
      .where(eq(thing.campaignId, campaignResult[0].id))
      .orderBy(desc(thing.updatedAt))
      .limit(count ?? DEFAULT_COUNT)

    return new Response(JSON.stringify(things), { status: 200 })
  } catch (error) {
    console.error('Error fetching things:', error)
    Honeybadger.notify(error as Error)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    })
  }
}

/**
 * POST /api/campaigns/[campaignSlug]/things
 * Creates a new thing (entity) within a specific campaign
 *
 * @param request.body.newThing - Thing data
 * @param request.body.newThing.name - Thing name (1-255 characters)
 * @param request.body.newThing.typeId - Thing type ID (positive integer)
 *
 * @example
 * ```json
 * {
 *   "newThing": {
 *     "name": "Goblin Chief Klarg",
 *     "typeId": 1
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

    const NewThing = z.object({
      name: z.string().min(1).max(255),
      typeId: z.number().int().positive(),
    })

    const { newThing } = await request.json()
    const parsedThing = NewThing.safeParse(newThing)

    if (!parsedThing.success) {
      return new Response(JSON.stringify({ error: 'Invalid thing data' }), {
        status: 400,
      })
    }

    const now = new Date()
    const result = await db
      .insert(thing)
      .values({
        slug: slugify(parsedThing.data.name),
        name: parsedThing.data.name,
        typeId: parsedThing.data.typeId,
        campaignId: campaignResult[0].id,
        createdAt: now,
        updatedAt: now,
      })
      .returning()

    return new Response(JSON.stringify(result[0]), { status: 201 })
  } catch (error) {
    console.error('Error creating thing:', error)
    // Honeybadger.notify(error as Error)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    })
  }
}
