import { auth } from '@/lib/auth/auth'
import { db } from '@/lib/db/db'
import { campaign } from '@/lib/db/schema'
import { slugify } from '@/lib/utils'
import Honeybadger from '@honeybadger-io/js'
import type { APIRoute } from 'astro'
import { eq } from 'drizzle-orm'
import * as z from 'zod'

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

    return new Response(JSON.stringify(campaigns), { status: 200 })
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    Honeybadger.notify(error)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    })
  }
}

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
    Honeybadger.notify(error)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    })
  }
}
