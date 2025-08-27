import SearchBar from '@components/app/components/search-bar/search-bar.tsx'
import { css } from '@emotion/css'
import { cn } from '@lib/utils/cn.ts'
import { useAppStore } from '@stores/appStore.ts'
import Prism from 'prismjs'
import 'prismjs/components/prism-markdown'
import { useCallback, useMemo, useState } from 'react'
import {
  createEditor,
  type Descendant,
  type NodeEntry,
  type Range,
  Text,
  Transforms,
} from 'slate'
import { withHistory } from 'slate-history'
import {
  Editable,
  type RenderLeafProps,
  Slate,
  useSlate,
  withReact,
} from 'slate-react'
import type { CustomEditor } from './custom-types.d.ts'

export const defaultEditorValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: '' }],
  },
]

type TMarkdownEditorProps = {
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

  const handleChange = useCallback((nextValue: Descendant[]) => {
    // Prevent empty editor state by ensuring we always have at least one paragraph
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
        className={cn(
          'border-border focus:ring-primary resize-y overflow-y-auto rounded border p-4 focus:border-transparent focus:ring-2 focus:outline-none',
          height === 'sm' && 'h-[200px]',
          height === 'md' && 'h-[500px]',
          height === 'lg' && 'h-[700px]'
        )}
      />
    </Slate>
  )
}

const Leaf = ({ attributes, children, leaf }: RenderLeafProps) => {
  const { campaignSlug } = useAppStore()
  const editor = useSlate()

  if (leaf.linkSearch && leaf.linkRange) {
    return (
      <span
        {...attributes}
        style={{
          position: 'relative',
          display: 'inline-block',
        }}
      >
        <SearchBar
          searchType='any'
          returnType='function'
          onSelect={(result) => {
            if (!result) return
            if (!leaf.linkRange) return
            // Replace the [[]] with [[type#slug]]
            const newText = `[[${result.type}#${result.entitySlug}]]`

            // Create the range to replace
            const range = {
              anchor: {
                path: leaf.linkRange.path,
                offset: leaf.linkRange.offset,
              },
              focus: {
                path: leaf.linkRange.path,
                offset: leaf.linkRange.offset + leaf.linkRange.length,
              },
            }

            // Select the range and replace with new text
            Transforms.select(editor, range)
            Transforms.insertText(editor, newText)
          }}
        />
        {children}
      </span>
    )
  }

  if (leaf.link && leaf.linkSlug && leaf.linkType) {
    const href =
      leaf.linkType === 'arc'
        ? `/dashboard/campaign/${campaignSlug}/arc/${leaf.linkSlug}`
        : `/dashboard/campaign/${campaignSlug}/thing/${leaf.linkSlug}`

    return (
      <a
        {...attributes}
        href={href}
        className='text-primary cursor-pointer underline'
        onMouseDown={(e) => {
          e.stopPropagation()
        }}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          window.location.href = href
        }}
        style={{
          position: 'relative',
          zIndex: 1,
        }}
      >
        {children}
      </a>
    )
  }

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
