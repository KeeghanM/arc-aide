/**
 * Utility functions for extracting plain text from Slate AST JSON
 * This ensures search indexes contain clean, readable text instead of JSON structure
 */

interface SlateNode {
  type?: string
  text?: string
  children?: SlateNode[]
}

type SlateValue = SlateNode | SlateNode[] | string | null | undefined

/**
 * Recursively extracts plain text from a Slate AST node or array of nodes
 */
function extractTextFromSlateNode(node: SlateNode): string {
  // If it's a text node, return the text
  if (typeof node.text === 'string') {
    return node.text
  }

  // If it has children, recursively extract text from them
  if (Array.isArray(node.children)) {
    return node.children.map(extractTextFromSlateNode).join(' ')
  }

  return ''
}

/**
 * Extracts plain text from a Slate AST value
 * Handles various input formats: JSON string, parsed object, array, etc.
 */
export function extractPlainTextFromSlate(slateValue: SlateValue): string {
  if (!slateValue) {
    return ''
  }

  try {
    let parsedValue: SlateNode | SlateNode[]

    // If it's a string, try to parse it as JSON
    if (typeof slateValue === 'string') {
      try {
        parsedValue = JSON.parse(slateValue)
      } catch {
        // If parsing fails, treat it as plain text
        return slateValue
      }
    } else {
      parsedValue = slateValue as SlateNode | SlateNode[]
    }

    // Handle array of nodes
    if (Array.isArray(parsedValue)) {
      return parsedValue.map(extractTextFromSlateNode).join(' ')
    }

    // Handle single node
    return extractTextFromSlateNode(parsedValue)
  } catch (error) {
    console.warn('Failed to extract text from Slate value:', error)
    return ''
  }
}

/**
 * Extracts plain text from multiple Slate AST fields
 * Useful for processing arc data with multiple rich text fields
 */
export function extractPlainTextFromSlateFields(
  fields: Record<string, SlateValue>
): Record<string, string> {
  const result: Record<string, string> = {}

  for (const [key, value] of Object.entries(fields)) {
    result[key] = extractPlainTextFromSlate(value)
  }

  return result
}
