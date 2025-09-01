import Prism from 'prismjs'
import 'prismjs/components/prism-markdown'
import { type NodeEntry, type Range, Text } from 'slate'

export const createDecorator = () => {
  return ([node, path]: NodeEntry) => {
    const ranges: Range[] = []

    if (!Text.isText(node)) {
      return ranges
    }

    // --- Link detection for [[...]] syntax ---
    const linkRegex = /\[\[([^\]]*)\]\]/g
    let match
    while ((match = linkRegex.exec(node.text)) !== null) {
      const content = match[1].trim()

      if (!content || content === '') {
        // Empty brackets - show search
        ranges.push({
          linkSearch: true,
          linkRange: { path, offset: match.index, length: match[0].length },
          anchor: { path, offset: match.index },
          focus: { path, offset: match.index + match[0].length },
        })
      } else if (content.includes('#')) {
        // Resolved link with type#slug format
        const [type, slug] = content.split('#', 2)
        ranges.push({
          link: true,
          linkType: type,
          linkSlug: slug,
          anchor: { path, offset: match.index },
          focus: { path, offset: match.index + match[0].length },
        })
      } else {
        // Invalid format - treat as search
        ranges.push({
          linkSearch: true,
          linkRange: { path, offset: match.index, length: match[0].length },
          anchor: { path, offset: match.index },
          focus: { path, offset: match.index + match[0].length },
        })
      }
    }

    // --- Syntax highlighting with Prism.js ---
    // Calculate token lengths for accurate range positioning
    const getLength = (token: string | Prism.Token): number => {
      if (typeof token === 'string') {
        return token.length
      } else if (typeof token.content === 'string') {
        return token.content.length
      } else {
        return (token.content as Prism.Token[]).reduce(
          (l, t) => l + getLength(t),
          0
        )
      }
    }

    const tokens = Prism.tokenize(node.text, Prism.languages.markdown)
    let start = 0

    for (const token of tokens) {
      const length = getLength(token)
      const end = start + length

      if (typeof token !== 'string') {
        ranges.push({
          [token.type]: true,
          anchor: { path, offset: start },
          focus: { path, offset: end },
        })
      }

      start = end
    }

    return ranges
  }
}
