import { auth } from '@/lib/auth/auth'
import { db } from '@/lib/db/db'
import { campaign } from '@/lib/db/schema'
import { fuzzySearchWithHighlight, searchWithHighlight } from '@/lib/db/search'
import type { APIRoute } from 'astro'
import { and, eq } from 'drizzle-orm'

/**
 * GET /api/campaigns/[campaignSlug]/search
 * Search for content within a specific campaign
 *
 * @param searchParams.q - Search query string
 * @param searchParams.type - Content type filter ('any', 'arc', 'thing') - defaults to 'any'
 * @param searchParams.fuzzy - Enable fuzzy search ('true' or 'false') - defaults to 'false'
 *
 * @example
 * GET /api/campaigns/my-campaign/search?q=goblin&type=arc&fuzzy=true
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

    const url = new URL(request.url)
    const searchParams = url.searchParams
    const query = searchParams.get('query') || ''
    const type = searchParams.get('type') || 'any' // 'any', 'arc', 'thing', etc.
    const fuzzy =
      searchParams.get('fuzzy') === 'true' || searchParams.get('fuzzy') === '1'

    // Use fuzzy search if enabled, otherwise fall back to exact search
    const results = fuzzy
      ? await fuzzySearchWithHighlight(query, campaignResult[0].id, type, true)
      : await searchWithHighlight(query, campaignResult[0].id, type)

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
