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

export interface FuzzySearchResult extends SearchResult {
  highlight: string
  correctedQuery?: string
  originalQuery: string
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

/**
 * Spell-corrects individual search terms using fuzzy string matching
 * Uses Turso's fuzzy extension with Levenshtein distance
 */
export async function spellCorrectTerms(
  terms: string[]
): Promise<Map<string, string>> {
  if (terms.length === 0) return new Map()

  try {
    const corrections = new Map<string, string>()

    // Query each term individually using fuzzy extension functions
    for (const term of terms) {
      const lowercaseTerm = term.toLowerCase()

      // Find the best match using Levenshtein distance
      // First try exact match, then fuzzy match with distance <= 2
      const result = (await db.all(sql`
        SELECT term, levenshtein(term, ${lowercaseTerm}) as distance
        FROM search_vocabulary 
        WHERE levenshtein(term, ${lowercaseTerm}) <= 2
        ORDER BY distance ASC, frequency DESC
        LIMIT 1
      `)) as Array<{ term: string; distance: number }>

      if (result.length > 0) {
        corrections.set(lowercaseTerm, result[0].term)
      } else {
        // If no fuzzy match found, use original term
        corrections.set(lowercaseTerm, lowercaseTerm)
      }
    }

    return corrections
  } catch (error) {
    console.warn(
      'Fuzzy extension not available, falling back to original terms:',
      error
    )
    // Fallback to original terms if fuzzy extension isn't available
    return new Map(terms.map((term) => [term.toLowerCase(), term]))
  }
}

/**
 * Extracts search terms from a query string, preserving FTS operators
 */
export function extractSearchTerms(query: string): {
  terms: string[]
  template: string
} {
  // Simple regex to extract alphanumeric terms, ignoring FTS operators
  const ftsOperators = new Set(['AND', 'OR', 'NOT', 'NEAR'])
  const termRegex = /[a-zA-Z0-9\u0080-\uffff]+/g
  const terms: string[] = []
  let template = query
  let match

  while ((match = termRegex.exec(query)) !== null) {
    const term = match[0]
    const nextChar = query[match.index + term.length]

    // Skip if it's an FTS operator, column name (followed by :), or partial search (followed by *)
    if (
      !ftsOperators.has(term.toUpperCase()) &&
      nextChar !== ':' &&
      nextChar !== '*'
    ) {
      terms.push(term)
    }
  }

  return { terms, template }
}

/**
 * Applies spell corrections to a search query template
 */
export function applyCorrectedTerms(
  template: string,
  originalTerms: string[],
  corrections: Map<string, string>
): string {
  let correctedQuery = template

  for (const term of originalTerms) {
    const correction = corrections.get(term.toLowerCase())
    if (correction && correction !== term.toLowerCase()) {
      // Replace the term in the template (case-insensitive)
      const regex = new RegExp(`\\b${term}\\b`, 'gi')
      correctedQuery = correctedQuery.replace(regex, correction)
    }
  }

  return correctedQuery
}

/**
 * Enhanced search with fuzzy matching using spellfix
 */
export async function fuzzySearchWithHighlight(
  query: string,
  campaignId: number,
  type: string = 'any',
  enableFuzzy: boolean = true
): Promise<FuzzySearchResult[]> {
  const originalQuery = query

  let finalQuery = query
  let correctedQuery: string | undefined

  if (enableFuzzy) {
    try {
      const { terms, template } = extractSearchTerms(query)

      if (terms.length > 0) {
        const corrections = await spellCorrectTerms(terms)
        const appliedQuery = applyCorrectedTerms(template, terms, corrections)

        // Only use corrected query if it's different from original
        if (appliedQuery !== query) {
          finalQuery = appliedQuery
          correctedQuery = appliedQuery
        }
      }
    } catch (error) {
      console.warn('Fuzzy search failed, falling back to exact search:', error)
      // Continue with original query
    }
  }

  // Perform the search with the (possibly corrected) query
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
    WHERE search_index_fts MATCH ${finalQuery}
    AND campaign_id = ${campaignId}
    ${type !== 'any' ? sql`AND type = ${type}` : sql``}
    ORDER BY rank`

  const results = (await db.all(searchQuery)) as Array<
    SearchResult & { highlight: string }
  >

  return results.map((result) => ({
    ...result,
    originalQuery,
    correctedQuery,
  }))
}
