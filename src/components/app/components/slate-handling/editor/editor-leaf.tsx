import SearchBar from '@components/app/components/search-bar/search-bar.tsx'
import { css } from '@emotion/css'
import { useAppStore } from '@stores/appStore.ts'
import { Transforms } from 'slate'
import { type RenderLeafProps, useSlate } from 'slate-react'

export default function EditorLeaf({
  attributes,
  children,
  leaf,
}: RenderLeafProps) {
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
        text-decoration: ${leaf.underline && 'underline'};
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
