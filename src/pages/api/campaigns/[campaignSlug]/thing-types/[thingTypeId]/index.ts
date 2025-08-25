import { auth } from '@/lib/auth/auth'
import { db } from '@/lib/db/db'
import { campaign, thingType } from '@/lib/db/schema'
import Honeybadger from '@honeybadger-io/js'
import type { APIRoute } from 'astro'
import { and, eq } from 'drizzle-orm'
import * as z from 'zod'

/**
 * GET /api/campaigns/[campaignSlug]/thing-types/[thingTypeId]
 * Retrieves a specific thing type from a campaign
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

    const { campaignSlug, thingTypeId } = params

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

    const thingTypeResult = await db
      .select()
      .from(thingType)
      .where(
        and(
          eq(thingType.id, parseInt(thingTypeId as string)),
          eq(thingType.campaignId, campaignResult[0].id)
        )
      )

    if (thingTypeResult.length === 0) {
      return new Response(JSON.stringify({ error: 'Thing type not found' }), {
        status: 404,
      })
    }

    return new Response(JSON.stringify(thingTypeResult[0]), { status: 200 })
  } catch (error) {
    console.error('Error fetching thing type:', error)
    Honeybadger.notify(error as Error)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    })
  }
}

/**
 * PUT /api/campaigns/[campaignSlug]/thing-types/[thingTypeId]
 * Updates a specific thing type in a campaign
 *
 * @param request.body.updatedThingType - Thing type update data
 * @param request.body.updatedThingType.name - Thing type name (1-255 characters)
 *
 * @example
 * ```json
 * {
 *   "updatedThingType": {
 *     "name": "Non-Player Characters"
 *   }
 * }
 * ```
 */
export const PUT: APIRoute = async ({ request, params }) => {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      })
    }

    const { campaignSlug, thingTypeId } = params

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

    // Verify the thing type exists in this campaign
    const existingThingType = await db
      .select()
      .from(thingType)
      .where(
        and(
          eq(thingType.id, parseInt(thingTypeId as string)),
          eq(thingType.campaignId, campaignResult[0].id)
        )
      )

    if (existingThingType.length === 0) {
      return new Response(JSON.stringify({ error: 'Thing type not found' }), {
        status: 404,
      })
    }

    const UpdatedThingType = z.object({
      id: z.number().int().positive(),
      name: z.string().min(1).max(255),
    })

    const { updatedThingType } = await request.json()
    const parsedThingType = UpdatedThingType.safeParse(updatedThingType)

    if (!parsedThingType.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid thing type data' }),
        {
          status: 400,
        }
      )
    }

    const result = await db
      .update(thingType)
      .set({
        name: parsedThingType.data.name,
      })
      .where(eq(thingType.id, existingThingType[0].id))
      .returning()

    return new Response(JSON.stringify(result[0]), { status: 200 })
  } catch (error) {
    console.error('Error updating thing type:', error)
    Honeybadger.notify(error as Error)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    })
  }
}

/**
 * DELETE /api/campaigns/[campaignSlug]/thing-types/[thingTypeId]
 * Deletes a specific thing type from a campaign
 * Note: This will cascade delete all things of this type
 */
export const DELETE: APIRoute = async ({ request, params }) => {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      })
    }

    const { campaignSlug, thingTypeId } = params

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

    // Verify the thing type exists in this campaign
    const existingThingType = await db
      .select()
      .from(thingType)
      .where(
        and(
          eq(thingType.id, parseInt(thingTypeId as string)),
          eq(thingType.campaignId, campaignResult[0].id)
        )
      )

    if (existingThingType.length === 0) {
      return new Response(JSON.stringify({ error: 'Thing type not found' }), {
        status: 404,
      })
    }

    // Note: This will cascade delete all things of this type due to the foreign key constraint
    await db.delete(thingType).where(eq(thingType.id, existingThingType[0].id))

    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (error) {
    console.error('Error deleting thing type:', error)
    Honeybadger.notify(error as Error)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    })
  }
}
