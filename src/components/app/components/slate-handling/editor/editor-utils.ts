import { Editor, Transforms } from 'slate'
import type { CustomEditor } from './custom-types'

export const applyFormatting = (key: 'b' | 'i' | 'u', editor: CustomEditor) => {
  const { selection } = editor
  if (!selection) return

  const markdownSyntax = {
    b: { start: '**', end: '**' },
    i: { start: '*', end: '*' },
    u: { start: '<u>', end: '</u>' },
  }

  const syntax = markdownSyntax[key]

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
      selectedText.startsWith(syntax.start) && selectedText.endsWith(syntax.end)

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

export const addPublishableClickListeners = (
  editorRef: React.RefObject<HTMLDivElement | null>,
  editor: CustomEditor
) => {
  const editorEl = editorRef.current
  if (!editorEl) return
  // We need to add click event listeners to all top level items within the editor, aka the paragraphs
  // This is so we can handle the setting of certain sections to being private/public for the publishing feature
  // They all are `data-slate-node="element"`

  const elements = editorEl.querySelectorAll('[data-slate-node="element"]')

  elements.forEach((el, i) => {
    el.classList.add('publishable-element')
    // First, set the initial state based on the editor's AST
    if ((editor.children[i] as any).isSecret) {
      el.classList.add('secret')
    } else {
      el.classList.remove('secret')
    }

    // Now, setup the event listener if we haven't already
    // which toggles the 'secret' class on the element and updates the AST
    if (el.getAttribute('data-click-listener') === 'true') return

    // Mark that we've added the listener, so we don't add it again
    el.setAttribute('data-click-listener', 'true')

    // The event listener checks the current state in the AST, toggles it, and updates the class
    el.addEventListener('click', () => {
      const node = editor.children[i] as any
      const currentlyIsSecret = node.isSecret
      if (currentlyIsSecret) {
        el.classList.remove('secret')
        Transforms.setNodes(editor, { isSecret: false }, { at: [i] })
      } else {
        el.classList.add('secret')
        Transforms.setNodes(editor, { isSecret: true }, { at: [i] })
      }
    })
  })
}
