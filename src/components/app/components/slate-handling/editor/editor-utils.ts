import { Editor, Transforms } from 'slate'
import type { CustomEditor } from './custom-types'

export const handleKeyboardShortcuts = (
  e: React.KeyboardEvent,
  editor: CustomEditor,
  controlPressed: boolean
) => {
  // If control is pressed and the key is b, i, or u, toggle the respective formatting
  if (controlPressed && (e.key === 'b' || e.key === 'i' || e.key === 'u')) {
    e.preventDefault()

    const { selection } = editor
    if (!selection) return

    const markdownSyntax = {
      b: { start: '**', end: '**' },
      i: { start: '*', end: '*' },
      u: { start: '<u>', end: '</u>' },
    }

    const syntax = markdownSyntax[e.key as keyof typeof markdownSyntax]

    if (selection.anchor.offset === selection.focus.offset) {
      // No text selected - insert the syntax markers and position cursor between them
      const text = `${syntax.start}${syntax.end}`
      Transforms.insertText(editor, text)

      // Move cursor to between the markers
      const newOffset = selection.anchor.offset + syntax.start.length
      Transforms.select(editor, {
        anchor: { path: selection.anchor.path, offset: newOffset },
        focus: { path: selection.focus.path, offset: newOffset },
      })
    } else {
      // Text is selected - get the selected text
      const selectedText = Editor.string(editor, selection)

      // Check if the selected text is already wrapped with this format
      const isWrapped =
        selectedText.startsWith(syntax.start) &&
        selectedText.endsWith(syntax.end)

      if (isWrapped) {
        // Remove the formatting by unwrapping
        const unwrappedText = selectedText.slice(
          syntax.start.length,
          -syntax.end.length
        )
        Transforms.insertText(editor, unwrappedText)
      } else {
        // Add the formatting by wrapping
        const wrappedText = `${syntax.start}${selectedText}${syntax.end}`
        Transforms.insertText(editor, wrappedText)
      }
    }
  }
}
