import type { Descendant } from 'slate'

import showdown from 'showdown'

/**
 * Converts Slate.js rich text content to plain text.
 * @param nodes - The Slate.js nodes to convert.
 * @returns The plain text representation of the Slate.js content.
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
 * Converts Slate.js rich text content to HTML.
 * @param nodes - The Slate.js nodes to convert.
 * @returns The HTML representation of the Slate.js content.
 */
export function slateToHtml(nodes: Descendant[]): string {
  if (!nodes) {
    return ''
  }

  // We're actually storing markdown in the slate editor
  // but without the markdown syntax as any kind of node property
  // So, we extract the raw text (which is markdown) and convert it to HTML
  // using the markdown plugin
  const markdown = slateToPlainText(nodes)

  const converter = new showdown.Converter({
    tables: true,
    simplifiedAutoLink: true,
    strikethrough: true,
    tasklists: true,
  })

  return converter.makeHtml(markdown)
}
