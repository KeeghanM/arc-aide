import { sql } from 'drizzle-orm'
import { db } from './db'

export interface SearchResult {
  type: 'arc' | 'thing'
  entityId: number
  campaignId: number
  title: string
  content: string
  slug: string
  rank: number
}

export async function fullTextSearch(
  query: string,
  campaignId: number
): Promise<SearchResult[]> {
  let searchQuery = sql`
    SELECT 
      type,
      entity_id as entityId,
      campaign_id as campaignId,
      title,
      content,
      slug,
      bm25(search_index_fts) as rank
    FROM search_index_fts
    WHERE search_index_fts MATCH ${query}
    AND campaign_id = ${campaignId}
    ORDER BY rank`

  const results = await db.all(searchQuery)
  return results as SearchResult[]
}

export async function searchWithHighlight(
  query: string,
  campaignId: number,
  type: string = 'any'
): Promise<Array<SearchResult & { highlight: string }>> {
  let searchQuery = sql`
    SELECT 
      type,
      entity_id as entityId,
      campaign_id as campaignId,
      title,
      content,
      slug,
      bm25(search_index_fts) as rank,
      snippet(search_index_fts, 4, '<mark>', '</mark>', '...', 5) as highlight
    FROM search_index_fts
    WHERE search_index_fts MATCH ${query}
    AND campaign_id = ${campaignId}
    ${type !== 'any' ? sql`AND type = ${type}` : sql``}
    ORDER BY rank`

  const results = await db.all(searchQuery)
  return results as Array<SearchResult & { highlight: string }>
}
