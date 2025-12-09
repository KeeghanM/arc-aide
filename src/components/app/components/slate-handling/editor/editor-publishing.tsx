import { Button } from '@components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@components/ui/tooltip'
import { Eye, EyeClosed } from 'lucide-react'
import { useState } from 'react'
import type { CustomEditor } from './custom-types'
import { setPublishingMode } from './editor-utils'

type EditorPublishingProps = {
  editorRef: React.RefObject<HTMLDivElement | null>
  editor: CustomEditor
}

export function EditorPublishing({ editor, editorRef }: EditorPublishingProps) {
  const [isPublishOn, setIsPublishOn] = useState(false)

  if (!editor || !editorRef) return null

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          className='absolute right-4 bottom-4 z-10 rounded-full'
          variant={'secondary'}
          onClick={(e) => {
            e.preventDefault()

            setPublishingMode(editorRef, editor, !isPublishOn)
            setIsPublishOn(!isPublishOn)
          }}
        >
          {isPublishOn ? (
            <Eye className='h-4 w-4' />
          ) : (
            <EyeClosed className='h-4 w-4' />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>Enable/Disable Publishing Mode</TooltipContent>
    </Tooltip>
  )
}
