import showdown from 'showdown'
import type { Descendant } from 'slate'

/**
 * Slate.js Content Conversion Utilities
 *
 * ArcAide uses Slate.js as a markdown-aware rich text editor. Content is stored
 * as Slate AST (Abstract Syntax Tree) in the database, but users write in markdown.
 * These utilities convert between Slate AST and other formats for display and search.
 */

/**
 * Converts Slate.js rich text content to plain text for search indexing
 *
 * Recursively extracts all text content from Slate nodes, joining with newlines.
 * Used primarily for full-text search indexing where formatting isn't needed.
 */
export function slateToPlainText(nodes: Descendant[]): string {
  if (!nodes) {
    return ''
  }

  return nodes
    .map((n) => {
      if ('text' in n) {
        return n.text
      } else if ('children' in n) {
        return slateToPlainText(n.children as Descendant[])
      } else {
        return ''
      }
    })
    .join('\n')
}

/**
 * Converts Slate.js content to HTML for display purposes
 *
 * Since users write markdown in the Slate editor, we:
 * 1. Extract the raw text (which contains markdown syntax)
 * 2. Convert markdown to HTML using Showdown
 * 3. Return formatted HTML for browser display
 */
export function slateToHtml(nodes: Descendant[]): string {
  if (!nodes) {
    return ''
  }

  // Extract raw markdown text from Slate AST
  const markdown = slateToPlainText(nodes)

  // Configure Showdown for D&D content (tables for stats, etc.)
  const converter = new showdown.Converter({
    tables: true, // Support for stat blocks and tables
    simplifiedAutoLink: true, // Auto-link URLs for references
    strikethrough: true, // Strike through for crossed-out content
    tasklists: true, // Checkbox lists for quest tracking
  })

  return converter.makeHtml(markdown)
}
