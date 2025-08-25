import { css } from '@emotion/css'
import Prism from 'prismjs'
import 'prismjs/components/prism-markdown'
import { useCallback, useMemo, useState } from 'react'
import {
  type Descendant,
  type NodeEntry,
  type Range,
  Text,
  createEditor,
} from 'slate'
import { withHistory } from 'slate-history'
import { Editable, type RenderLeafProps, Slate, withReact } from 'slate-react'

import type { CustomEditor } from './custom-types.d.ts'

export const defaultEditorValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: '' }],
  },
]

export default function MarkdownEditor({
  initialValue,
  onChange,
}: {
  initialValue: Descendant[]
  onChange: (value: Descendant[]) => void
}) {
  const [value, setValue] = useState(
    initialValue && initialValue.length > 0 ? initialValue : defaultEditorValue
  )

  const handleChange = useCallback((nextValue: Descendant[]) => {
    const newValue =
      nextValue.length === 1 &&
      Text.isText(nextValue[0]) &&
      nextValue[0].text === ''
        ? defaultEditorValue
        : nextValue

    setValue(newValue)
    onChange(newValue)
  }, [])

  const renderLeaf = useCallback(
    (props: RenderLeafProps) => <Leaf {...props} />,
    []
  )
  const editor = useMemo(
    () => withHistory(withReact(createEditor())) as CustomEditor,
    []
  )
  const decorate = useCallback(([node, path]: NodeEntry) => {
    const ranges: Range[] = []

    if (!Text.isText(node)) {
      return ranges
    }

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
  }, [])

  return (
    <Slate
      editor={editor}
      initialValue={value}
      onChange={handleChange}
    >
      <Editable
        decorate={decorate}
        renderLeaf={renderLeaf}
        placeholder='Start writing...'
        className='border-border focus:ring-primary min-h-[200px] rounded border p-4 focus:border-transparent focus:ring-2 focus:outline-none'
      />
    </Slate>
  )
}

const Leaf = ({ attributes, children, leaf }: RenderLeafProps) => {
  return (
    <span
      {...attributes}
      className={css`
        font-weight: ${leaf.bold && 'bold'};
        font-style: ${leaf.italic && 'italic'};
        text-decoration: ${leaf.underlined && 'underline'};
        ${leaf.title &&
        css`
          display: inline-block;
          font-weight: bold;
          font-size: 20px;
          margin: 20px 0 10px 0;
        `} ${leaf.list &&
        css`
          padding-left: 10px;
          font-size: 20px;
          line-height: 10px;
        `} ${leaf.hr &&
        css`
          display: block;
          text-align: center;
          border-bottom: 2px solid #ddd;
        `} ${leaf.blockquote &&
        css`
          display: inline-block;
          border-left: 2px solid #ddd;
          padding-left: 10px;
          color: #aaa;
          font-style: italic;
        `} ${leaf.code &&
        css`
          font-family: monospace;
          background-color: #eee;
          padding: 3px;
        `}
      `}
    >
      {children}
    </span>
  )
}
