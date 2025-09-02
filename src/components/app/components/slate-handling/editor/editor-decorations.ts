import Prism from 'prismjs'
import 'prismjs/components/prism-markdown'
import { type NodeEntry, type Range, Text } from 'slate'

export const createDecorator = () => {
  return ([node, path]: NodeEntry) => {
    const ranges: Range[] = []

    if (!Text.isText(node)) {
      return ranges
    }

    // --- Image detection for ![]() syntax ---
    const imageRegex = /!\[([^\]]*)\]\(([^)]*)\)/g
    let imageMatch
    while ((imageMatch = imageRegex.exec(node.text)) !== null) {
      const alt = imageMatch[1]
      const url = imageMatch[2]

      // We only show the search if there isn't a URL
      ranges.push({
        alt: alt,
        imageSearch: url?.length === 0,
        replacementRange: {
          path,
          offset: imageMatch.index,
          length: imageMatch[0].length,
        },
        anchor: { path, offset: imageMatch.index },
        focus: { path, offset: imageMatch.index + imageMatch[0].length },
      })
    }

    // --- Link detection for [[...]] syntax ---
    const linkRegex = /\[\[([^\]]*)\]\]/g
    let linkMatch
    while ((linkMatch = linkRegex.exec(node.text)) !== null) {
      const content = linkMatch[1].trim()

      if (!content || content === '') {
        // Empty brackets - show search
        ranges.push({
          linkSearch: true,
          replacementRange: {
            path,
            offset: linkMatch.index,
            length: linkMatch[0].length,
          },
          anchor: { path, offset: linkMatch.index },
          focus: { path, offset: linkMatch.index + linkMatch[0].length },
        })
      } else if (content.includes('#')) {
        // Resolved link with type#slug format
        const [type, slug] = content.split('#', 2)
        ranges.push({
          link: true,
          linkType: type,
          linkSlug: slug,
          anchor: { path, offset: linkMatch.index },
          focus: { path, offset: linkMatch.index + linkMatch[0].length },
        })
      } else {
        // Invalid format - treat as search
        ranges.push({
          linkSearch: true,
          replacementRange: {
            path,
            offset: linkMatch.index,
            length: linkMatch[0].length,
          },
          anchor: { path, offset: linkMatch.index },
          focus: { path, offset: linkMatch.index + linkMatch[0].length },
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
