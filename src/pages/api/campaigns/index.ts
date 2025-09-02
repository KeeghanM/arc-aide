import { auth } from '@auth/auth'
import { db } from '@db/db'
import { campaign } from '@db/schema'
import Honeybadger from '@honeybadger-io/js'
import { killBillClient } from '@lib/killbill/client'
import { slugify } from '@utils/string'
import type { APIRoute } from 'astro'
import { desc, eq } from 'drizzle-orm'
import * as z from 'zod'

/**
 * GET /api/campaigns
 * Retrieves all campaigns for the authenticated user
 */
export const GET: APIRoute = async ({ request }) => {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      })
    }

    const campaigns = await db
      .select()
      .from(campaign)
      .where(eq(campaign.userId, session.user.id))
      .orderBy(desc(campaign.updatedAt))

    return new Response(JSON.stringify(campaigns), { status: 200 })
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    Honeybadger.notify(error as Error)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    })
  }
}

/**
 * POST /api/campaigns
 * Creates a new campaign for the authenticated user
 *
 * @param request.body.newCampaign - Campaign data
 * @param request.body.newCampaign.name - Campaign name (1-255 characters)
 *
 * @example
 * ```json
 * {
 *   "newCampaign": {
 *     "name": "Lost Mine of Phandelver"
 *   }
 * }
 * ```
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      })
    }

    const subscriptionStatus = await killBillClient.getSubscriptionStatus(
      session.user.id
    )

    if (!subscriptionStatus || !subscriptionStatus.hasActiveSubscription) {
      // We now need to check for how many campaigns the user has
      const userCampaigns = await db
        .select()
        .from(campaign)
        .where(eq(campaign.userId, session.user.id))

      if (userCampaigns.length >= 1) {
        return new Response(
          JSON.stringify({
            error:
              'You have reached the limit of 1 campaign for free accounts. Please upgrade to create more campaigns.',
          }),
          { status: 403 }
        )
      }
    }

    const NewCampaign = z.object({
      name: z.string().min(1).max(255),
    })

    const { newCampaign } = await request.json()
    const parsedCampaign = NewCampaign.safeParse(newCampaign)

    if (!parsedCampaign.success) {
      return new Response(JSON.stringify({ error: 'Invalid campaign data' }), {
        status: 400,
      })
    }

    const now = new Date()
    const result = await db
      .insert(campaign)
      .values({
        slug: slugify(parsedCampaign.data.name),
        name: parsedCampaign.data.name,
        userId: session.user.id,
        createdAt: now,
        updatedAt: now,
      })
      .returning()

    return new Response(JSON.stringify(result[0]), { status: 201 })
  } catch (error) {
    console.error('Error creating campaign:', error)
    Honeybadger.notify(error as Error)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    })
  }
}
