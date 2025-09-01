import { Button } from '@components/ui/button'
import {
  BoldIcon,
  ImageIcon,
  ItalicIcon,
  Link2Icon,
  UnderlineIcon,
} from 'lucide-react'
import { Transforms } from 'slate'
import type { CustomEditor } from './custom-types'

type EditorToolbarProps = {
  editor: CustomEditor
  isFocused: boolean
}

export default function EditorToolbar({
  editor,
  isFocused,
}: EditorToolbarProps) {
  if (!isFocused) return null

  return (
    <div className='flex w-full items-center gap-1 rounded-sm bg-slate-300 p-2'>
      <Button
        variant='ghost'
        onClick={() => {
          Transforms.insertText(editor, '![Image Label](https://)')
        }}
      >
        <ImageIcon className='h-4 w-4' />
      </Button>
      <Button
        variant='ghost'
        onClick={() => {
          Transforms.insertText(editor, '[[]]')
        }}
      >
        <Link2Icon className='h-4 w-4' />
      </Button>
      <Button
        variant='ghost'
        onClick={() => {}}
      >
        <BoldIcon className='h-4 w-4' />
      </Button>

      <Button
        variant='ghost'
        onClick={() => {}}
      >
        <ItalicIcon className='h-4 w-5' />
      </Button>

      <Button
        variant='ghost'
        onClick={() => {}}
      >
        <UnderlineIcon className='h-4 w-4' />
      </Button>
    </div>
  )
}
