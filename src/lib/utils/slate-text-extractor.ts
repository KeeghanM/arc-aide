import showdown from 'showdown'
import type { Descendant } from 'slate'
import { properCase } from './string'

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
export function slateToHtml(nodes: Descendant[], campaignSlug: string): string {
  if (!nodes) {
    return ''
  }

  // Extract raw markdown text from Slate AST
  const markdown = slateToPlainText(nodes)

  // Configure Showdown for D&D content (tables for stats, etc.)
  const converter = new showdown.Converter({
    tables: true, // Support for stat blocks and tables
    strikethrough: true, // Strike through for crossed-out content
    tasklists: true, // Checkbox lists for quest tracking
  })

  // We want to add labels below images if alt text is provided
  converter.addExtension(() => {
    return [
      {
        type: 'output',
        regex: /<img src="([^"]+)" alt="([^"]*)" ?\/?>/g,
        replace: (_match: string, src: string, alt: string) => {
          if (alt && alt.trim() !== '') {
            return `<figure class="text-center max-w-fit"><img src="${src}" alt="${alt}" class="max-w-full h-auto" /><figcaption class="italic text-sm text-gray-500">${alt}</figcaption></figure>`
          } else {
            return `<img src="${src}" alt="" class="max-w-full h-auto" />`
          }
        },
      },
    ]
  })

  const html = converter.makeHtml(markdown)

  // We need to replace any [[type#slug]] links with proper anchor tags.
  const linkRegex = /\[\[([^\]]+)\]\]/g

  return html.replace(linkRegex, (_, content) => {
    const [type, slug] = content.split('#', 2)
    if (type && slug) {
      return `<a href="/dashboard/campaign/${campaignSlug}/${type}/${slug}/">${properCase(slug)}</a>`
    } else {
      // If format is invalid, just return the raw text
      return `[[${content}]]`
    }
  })
}
