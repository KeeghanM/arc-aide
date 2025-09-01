import { slateToHtml } from '@lib/utils/slate-text-extractor'
import type { Descendant } from 'slate'
import { useAppStore } from '../../stores/appStore'

type TSlateViewerProps = {
  content: Descendant[]
}

/**
 * This component provides a read-only viewer for Slate.js content.
 * It is used to display content in a non-editable format, preserving
 * the rich text formatting and internal links. And shows it to the user
 * in a D&D style, beautiful way. Links, titles, bold, italics, are all
 * rendered out without the Markdown tags.
 */

export default function SlateViewer({ content }: TSlateViewerProps) {
  const { campaignSlug } = useAppStore()
  return (
    <div
      className='dnd-content max-w-none rounded-lg bg-[#ead9cd] p-12 shadow-lg'
      dangerouslySetInnerHTML={{
        __html: slateToHtml(content, campaignSlug ?? ''),
      }}
    />
  )
}
