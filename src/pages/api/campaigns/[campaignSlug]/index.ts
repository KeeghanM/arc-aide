import Honeybadger from '@honeybadger-io/js'
import { auth } from '@lib/auth/auth'
import { db } from '@lib/db/db'
import { campaign } from '@lib/db/schema'
import { slugify } from '@lib/utils'
import type { APIRoute } from 'astro'
import { and, eq } from 'drizzle-orm'
import z from 'zod'

/**
 * Get Campaign API Route
 * GET /api/campaigns/[campaignSlug]
 *
 * Allows the authenticated user to fetch details of a specific campaign they own.
 *
 * @param params.campaignSlug - The slug identifier of the campaign to retrieve
 *
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
    if (
      !campaignSlug ||
      !z.string().nonempty().safeParse(campaignSlug).success
    ) {
      return new Response(JSON.stringify({ error: 'Invalid campaign slug' }), {
        status: 400,
      })
    }

    const campaignData = await db
      .select()
      .from(campaign)
      .where(
        and(
          eq(campaign.userId, session.user.id),
          eq(campaign.slug, campaignSlug)
        )
      )
      .limit(1)

    if (!campaignData?.[0]) {
      return new Response(JSON.stringify({ error: 'Campaign not found' }), {
        status: 404,
      })
    }

    return new Response(JSON.stringify(campaignData[0]), { status: 200 })
  } catch (error) {
    console.error('Error fetching campaign:', error)
    Honeybadger.notify(error as Error)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    })
  }
}

/**
 * Delete Campaign API Route
 * DELETE /api/campaigns/[campaignSlug]
 *
 * Allows the authenticated user to delete a campaign they own.
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

    const { campaignSlug } = params
    if (
      !campaignSlug ||
      !z.string().nonempty().safeParse(campaignSlug).success
    ) {
      return new Response(JSON.stringify({ error: 'Invalid campaign slug' }), {
        status: 400,
      })
    }

    await db
      .delete(campaign)
      .where(
        and(
          eq(campaign.userId, session.user.id),
          eq(campaign.slug, campaignSlug)
        )
      )

    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (error) {
    console.error('Error deleting campaign:', error)
    Honeybadger.notify(error as Error)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    })
  }
}

/**
 * Update Campaign API Route
 * PUT /api/campaigns/[campaignSlug]
 *
 * Allows the authenticated user to update the name and description of a campaign they own.
 *
 * @param request.body.updatedCampaign - Campaign data to update
 * @param request.body.updatedCampaign.name - New campaign name (1-255 characters)
 * @param request.body.updatedCampaign.description - New campaign description (optional)
 *
 * @example
 * ```json
 * {
 *   "updatedCampaign": {
 *     "name": "New Campaign Name",
 *     "description": "[{\"type\":\"paragraph\",\"children\":[{\"text\":\"Updated description.\"}]}]"
 *   }
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

    const { campaignSlug } = params
    if (
      !campaignSlug ||
      !z.string().nonempty().safeParse(campaignSlug).success
    ) {
      return new Response(JSON.stringify({ error: 'Invalid campaign slug' }), {
        status: 400,
      })
    }

    const UpdatedCampaign = z.object({
      name: z.string().min(1).max(255).optional(),
      published: z.boolean().optional(),
    })

    const { updatedCampaign } = await request.json()
    const parsedCampaign = UpdatedCampaign.safeParse(updatedCampaign)
    if (!parsedCampaign.success) {
      return new Response(
        JSON.stringify({
          error: 'Invalid campaign data',
          details: parsedCampaign.error,
        }),
        { status: 400 }
      )
    }

    const now = new Date()
    const updateData: any = {
      updatedAt: now,
    }

    if (parsedCampaign.data.name) {
      updateData.name = parsedCampaign.data.name
      updateData.slug = slugify(parsedCampaign.data.name)
    }
    if (parsedCampaign.data.published !== undefined)
      updateData.published = parsedCampaign.data.published

    // If no fields to update, return early
    if (Object.keys(updateData).length === 1) {
      return new Response(
        JSON.stringify({ error: 'No valid fields to update' }),
        { status: 400 }
      )
    }

    const result = await db
      .update(campaign)
      .set(updateData)
      .where(
        and(
          eq(campaign.userId, session.user.id),
          eq(campaign.slug, campaignSlug)
        )
      )
      .returning()

    return new Response(JSON.stringify(result[0]), { status: 200 })
  } catch (error) {
    console.error('Error updating campaign:', error)
    Honeybadger.notify(error as Error)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    })
  }
}
