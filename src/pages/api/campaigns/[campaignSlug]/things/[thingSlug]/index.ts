import { auth } from '@/lib/auth/auth'
import { db } from '@/lib/db/db'
import { campaign, thing } from '@/lib/db/schema'
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

    return new Response(JSON.stringify(thingResult[0]), { status: 200 })
  } catch (error) {
    console.error('Error fetching thing:', error)
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

    // Verify the thing exists in this campaign
    const existingThing = await db
      .select()
      .from(thing)
      .where(
        and(
          eq(thing.slug, thingSlug as string),
          eq(thing.campaignId, campaignResult[0].id)
        )
      )

    if (existingThing.length === 0) {
      return new Response(JSON.stringify({ error: 'Thing not found' }), {
        status: 404,
      })
    }

    const UpdatedThing = z.object({
      slug: z.string().min(1).max(255),
      name: z.string().min(1).max(255).optional(),
      typeId: z.number().int().positive().optional(),
      description: z.any().optional(),
    })

    const { updatedThing } = await request.json()
    const parsedThing = UpdatedThing.safeParse(updatedThing)

    if (!parsedThing.success) {
      return new Response(JSON.stringify({ error: 'Invalid thing data' }), {
        status: 400,
      })
    }

    const updateData: any = {}

    // Only update fields if provided
    if (parsedThing.data.name !== undefined) {
      updateData.name = parsedThing.data.name
      // Only update slug if name is being changed
      if (parsedThing.data.slug !== thingSlug) {
        updateData.slug = slugify(parsedThing.data.name)
      }
    }
    if (parsedThing.data.typeId !== undefined)
      updateData.typeId = parsedThing.data.typeId
    if (parsedThing.data.description !== undefined)
      updateData.description = parsedThing.data.description

    const result = await db
      .update(thing)
      .set(updateData)
      .where(eq(thing.id, existingThing[0].id))
      .returning()

    return new Response(JSON.stringify(result[0]), { status: 200 })
  } catch (error) {
    console.error('Error updating thing:', error)
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

    // Verify the thing exists in this campaign
    const existingThing = await db
      .select()
      .from(thing)
      .where(
        and(
          eq(thing.slug, thingSlug as string),
          eq(thing.campaignId, campaignResult[0].id)
        )
      )

    if (existingThing.length === 0) {
      return new Response(JSON.stringify({ error: 'Thing not found' }), {
        status: 404,
      })
    }

    await db.delete(thing).where(eq(thing.id, existingThing[0].id))

    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (error) {
    console.error('Error deleting thing:', error)
    Honeybadger.notify(error as Error)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    })
  }
}
