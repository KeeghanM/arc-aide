import { auth } from '@auth/auth'
import { db } from '@db/db'
import { campaign } from '@db/schema'
import { fuzzySearchWithHighlight, searchWithHighlight } from '@db/search'
import type { APIRoute } from 'astro'
import { and, eq } from 'drizzle-orm'

/**
 * Campaign Search API Endpoint
 *
 * GET /api/campaigns/[campaignSlug]/search
 *
 * Provides full-text search capabilities within a specific D&D campaign.
 * Supports both exact and fuzzy matching with content type filtering.
 * Returns highlighted search results with spell correction suggestions.
 *
 * @param request - The incoming HTTP request object.
 * @param params - Route parameters, including the campaign slug.
 * @returns A Response containing search results or an error message.
 *
 * @remarks
 * Query parameters:
 * - `query`: The search query string (required).
 * - `type`: Content filter ('any', 'arc', 'thing'). Defaults to 'any'.
 * - `fuzzy`: Enables fuzzy/spell-corrected search ('true'/'false'). Defaults to 'false'.
 *
 * Security: Validates user ownership of campaign before allowing search
 */
export const GET: APIRoute = async ({ request, params }) => {
  try {
    // --- Authentication check ---
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      })
    }

    const { campaignSlug } = params

    // --- Authorization: verify campaign ownership ---
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

    // --- Parse search parameters ---
    const url = new URL(request.url)
    const searchParams = url.searchParams
    const query = searchParams.get('query') || ''
    const type = searchParams.get('type') || 'any' // Content type filter
    const fuzzy =
      searchParams.get('fuzzy') === 'true' || searchParams.get('fuzzy') === '1'

    // Only alphanumeric and spaces allowed in search query, anything
    // else completely breaks FTS5 syntax
    const cleanQuery = query.replace(/[^a-zA-Z0-9\s]/g, '').trim()

    // --- Execute search with appropriate strategy ---
    const results = fuzzy
      ? await fuzzySearchWithHighlight(
          cleanQuery,
          campaignResult[0].id,
          type,
          true
        )
      : await searchWithHighlight(cleanQuery, campaignResult[0].id, type)

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
