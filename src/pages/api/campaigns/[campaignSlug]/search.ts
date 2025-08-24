import { auth } from '@/lib/auth/auth'
import { db } from '@/lib/db/db'
import { campaign } from '@/lib/db/schema'
import { searchWithHighlight } from '@/lib/db/search'
import type { APIRoute } from 'astro'
import { and, eq } from 'drizzle-orm'

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

    const url = new URL(request.url)
    const searchParams = url.searchParams
    const query = searchParams.get('query') || ''
    const type = searchParams.get('type') || 'any' // 'any', 'arc', 'thing', etc.

    const results = await searchWithHighlight(query, campaignResult[0].id, type)

    return new Response(JSON.stringify(results), {
      status: 200,
    })
  } catch (error) {
    console.error('Error in search API:', error)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    })
  }
}
