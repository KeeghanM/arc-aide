import { auth } from '@/lib/auth/auth'
import { db } from '@/lib/db/db'
import { arc, campaign } from '@/lib/db/schema'
import { slugify } from '@/lib/utils'
import Honeybadger from '@honeybadger-io/js'
import type { APIRoute } from 'astro'
import { and, eq } from 'drizzle-orm'
import * as z from 'zod'

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

    const { campaignSlug, arcSlug } = params

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

    return new Response(JSON.stringify(arcResult[0]), { status: 200 })
  } catch (error) {
    console.error('Error fetching arc:', error)
    Honeybadger.notify(error as Error)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    })
  }
}

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

    const { campaignSlug, arcSlug } = params

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

    // Verify the arc exists in this campaign
    const existingArc = await db
      .select()
      .from(arc)
      .where(
        and(
          eq(arc.slug, arcSlug as string),
          eq(arc.campaignId, campaignResult[0].id)
        )
      )

    if (existingArc.length === 0) {
      return new Response(JSON.stringify({ error: 'Arc not found' }), {
        status: 404,
      })
    }

    const UpdatedArc = z.object({
      slug: z.string().min(1).max(255),
      name: z.string().min(1).max(255).optional(),
      hook: z.any().optional(),
      protagonist: z.any().optional(),
      antagonist: z.any().optional(),
      problem: z.any().optional(),
      key: z.string().optional(),
      outcome: z.any().optional(),
    })

    const { updatedArc } = await request.json()
    const parsedArc = UpdatedArc.safeParse(updatedArc)

    if (!parsedArc.success) {
      return new Response(JSON.stringify({ error: 'Invalid arc data' }), {
        status: 400,
      })
    }

    const now = new Date()
    const updateData: any = {
      updatedAt: now,
    }

    // Only update slug if it's different
    if (parsedArc.data.name && parsedArc.data.slug !== arcSlug) {
      updateData.slug = slugify(parsedArc.data.name)
    }

    // Add optional fields if provided
    if (parsedArc.data.name !== undefined) updateData.name = parsedArc.data.name
    if (parsedArc.data.hook !== undefined) updateData.hook = parsedArc.data.hook
    if (parsedArc.data.protagonist !== undefined)
      updateData.protagonist = parsedArc.data.protagonist
    if (parsedArc.data.antagonist !== undefined)
      updateData.antagonist = parsedArc.data.antagonist
    if (parsedArc.data.problem !== undefined)
      updateData.problem = parsedArc.data.problem
    if (parsedArc.data.key !== undefined) updateData.key = parsedArc.data.key
    if (parsedArc.data.outcome !== undefined)
      updateData.outcome = parsedArc.data.outcome

    // If no fields to update, return early
    if (Object.keys(updateData).length === 1) {
      return new Response(JSON.stringify(existingArc[0]), { status: 200 })
    }

    const result = await db
      .update(arc)
      .set(updateData)
      .where(eq(arc.id, existingArc[0].id))
      .returning()

    return new Response(JSON.stringify(result[0]), { status: 200 })
  } catch (error) {
    console.error('Error updating arc:', error)
    Honeybadger.notify(error as Error)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    })
  }
}

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

    const { campaignSlug, arcSlug } = params

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

    // Verify the arc exists in this campaign
    const existingArc = await db
      .select()
      .from(arc)
      .where(
        and(
          eq(arc.slug, arcSlug as string),
          eq(arc.campaignId, campaignResult[0].id)
        )
      )

    if (existingArc.length === 0) {
      return new Response(JSON.stringify({ error: 'Arc not found' }), {
        status: 404,
      })
    }

    await db.delete(arc).where(eq(arc.id, existingArc[0].id))

    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (error) {
    console.error('Error deleting arc:', error)
    Honeybadger.notify(error as Error)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    })
  }
}
