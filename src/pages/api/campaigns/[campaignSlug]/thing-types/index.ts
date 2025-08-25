import { auth } from '@auth/auth'
import { db } from '@db/db'
import { campaign, thingType } from '@db/schema'
import Honeybadger from '@honeybadger-io/js'
import type { APIRoute } from 'astro'
import { and, eq } from 'drizzle-orm'
import * as z from 'zod'

/**
 * GET /api/campaigns/[campaignSlug]/thing-types
 * Retrieves all thing types for a specific campaign
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

    const thingTypes = await db
      .select()
      .from(thingType)
      .where(eq(thingType.campaignId, campaignResult[0].id))

    return new Response(JSON.stringify(thingTypes), { status: 200 })
  } catch (error) {
    console.error('Error fetching thing types:', error)
    Honeybadger.notify(error as Error)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    })
  }
}

/**
 * POST /api/campaigns/[campaignSlug]/thing-types
 * Creates a new thing type within a specific campaign
 *
 * @param request.body.newThingType - Thing type data
 * @param request.body.newThingType.name - Thing type name (1-255 characters)
 *
 * @example
 * ```json
 * {
 *   "newThingType": {
 *     "name": "NPCs"
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

    const NewThingType = z.object({
      name: z.string().min(1).max(255),
    })

    const { newThingType } = await request.json()
    const parsedThingType = NewThingType.safeParse(newThingType)

    if (!parsedThingType.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid thing type data' }),
        {
          status: 400,
        }
      )
    }

    const result = await db
      .insert(thingType)
      .values({
        name: parsedThingType.data.name,
        campaignId: campaignResult[0].id,
      })
      .returning()

    return new Response(JSON.stringify(result[0]), { status: 201 })
  } catch (error) {
    console.error('Error creating thing type:', error)
    Honeybadger.notify(error as Error)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    })
  }
}
