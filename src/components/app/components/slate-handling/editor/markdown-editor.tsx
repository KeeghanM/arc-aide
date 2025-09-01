import { cn } from '@lib/utils/cn.ts'
import { useCallback, useMemo, useState } from 'react'
import { createEditor, type Descendant, Text } from 'slate'
import { withHistory } from 'slate-history'
import { Editable, type RenderLeafProps, Slate, withReact } from 'slate-react'
import type { CustomEditor } from './custom-types'
import { createDecorator } from './editor-decorations'
import EditorLeaf from './editor-leaf'
import EditorToolbar from './editor-toolbar'
import { handleKeyboardShortcuts } from './editor-utils'

export const defaultEditorValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: '' }],
  },
]

export type TMarkdownEditorProps = {
  initialValue: Descendant[]
  onChange: (value: Descendant[]) => void
  height?: 'sm' | 'md' | 'lg'
}

export default function MarkdownEditor({
  initialValue,
  onChange,
  height = 'sm',
}: TMarkdownEditorProps) {
  const [value, setValue] = useState(
    initialValue && initialValue.length > 0 ? initialValue : defaultEditorValue
  )
  const [controlPressed, setControlPressed] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const handleChange = useCallback(
    (nextValue: Descendant[]) => {
      // Prevent empty editor state by ensuring we always have at least one paragraph
      const newValue =
        nextValue.length === 1 &&
        Text.isText(nextValue[0]) &&
        nextValue[0].text === ''
          ? defaultEditorValue
          : nextValue

      setValue(newValue)
      onChange(newValue)
    },
    [onChange]
  )

  const renderLeaf = useCallback(
    (props: RenderLeafProps) => <EditorLeaf {...props} />,
    []
  )

  const editor = useMemo(
    () => withHistory(withReact(createEditor())) as CustomEditor,
    []
  )

  const decorate = useCallback(createDecorator(), [])

  return (
    <div
      onFocus={() => {
        setIsFocused(true)
      }}
      onBlur={() => {
        setIsFocused(false)
      }}
    >
      <Slate
        editor={editor}
        initialValue={value}
        onChange={handleChange}
      >
        <EditorToolbar
          editor={editor}
          isFocused={isFocused}
        />
        <Editable
          decorate={decorate}
          renderLeaf={renderLeaf}
          placeholder='Start writing...'
          className={cn(
            'border-border focus:ring-primary resize-y overflow-y-auto rounded border p-4 focus:border-transparent focus:ring-2 focus:outline-none',
            height === 'sm' && 'h-[200px]',
            height === 'md' && 'h-[500px]',
            height === 'lg' && 'h-[700px]'
          )}
          onKeyDown={(e) => {
            setControlPressed(e.ctrlKey)
            handleKeyboardShortcuts(e, editor, controlPressed)
          }}
          onKeyUp={() => {
            setControlPressed(false)
          }}
        />
      </Slate>
    </div>
  )
}
