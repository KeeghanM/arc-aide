import { Button } from '@components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select'
import { useTranscription } from '@hooks/useTranscription'
import {
  BoldIcon,
  ImageIcon,
  ItalicIcon,
  Link2Icon,
  Mic,
  MicOff,
  Table,
  UnderlineIcon,
} from 'lucide-react'
import { useEffect } from 'react'
import { Transforms } from 'slate'
import type { CustomEditor } from './custom-types'
import { applyFormatting } from './editor-utils'

type EditorToolbarProps = {
  editor: CustomEditor
  isFocused: boolean
}

export function EditorToolbar({ editor, isFocused }: EditorToolbarProps) {
  const { isRecording, startRecording, stopRecording, setOnResult } =
    useTranscription()

  useEffect(() => {
    setOnResult((event) => {
      const result = event.results[event.results.length - 1]
      if (!result.isFinal) return

      Transforms.insertText(editor, `${result[0].transcript} `)
    })
  }, [setOnResult])

  if (!isFocused) return null

  return (
    <div className='flex w-full items-center gap-1 rounded-sm bg-slate-300 p-2'>
      <Button
        variant='ghost'
        onMouseDown={(e) => {
          e.preventDefault()
          Transforms.insertText(editor, '![Image Label]()')
        }}
      >
        <ImageIcon className='h-4 w-4' />
      </Button>
      <Button
        variant='ghost'
        onMouseDown={(e) => {
          e.preventDefault()
          Transforms.insertText(editor, '[[]]')
        }}
      >
        <Link2Icon className='h-4 w-4' />
      </Button>
      <Button
        variant='ghost'
        onMouseDown={(e) => {
          e.preventDefault()
          applyFormatting('b', editor)
        }}
      >
        <BoldIcon className='h-4 w-4' />
      </Button>
      <Button
        variant='ghost'
        onMouseDown={(e) => {
          e.preventDefault()
          applyFormatting('i', editor)
        }}
      >
        <ItalicIcon className='h-4 w-5' />
      </Button>
      <Button
        variant='ghost'
        onMouseDown={(e) => {
          e.preventDefault()
          applyFormatting('u', editor)
        }}
      >
        <UnderlineIcon className='h-4 w-4' />
      </Button>
      <Select
        onValueChange={(value) => {
          Transforms.insertText(editor, `#`.repeat(parseInt(value[1])) + ' ')
        }}
      >
        <SelectTrigger className='!text-foreground w-fit'>
          <SelectValue placeholder='Title' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='h1'>Heading 1</SelectItem>
          <SelectItem value='h2'>Heading 2</SelectItem>
          <SelectItem value='h3'>Heading 3</SelectItem>
          <SelectItem value='h4'>Heading 4</SelectItem>
          <SelectItem value='h5'>Heading 5</SelectItem>
        </SelectContent>
      </Select>
      <Button
        variant='ghost'
        onMouseDown={(e) => {
          e.preventDefault()

          Transforms.insertText(
            editor,
            `| Column 1 | Column 2 |
| -------- | -------- |
| Text     | Text     |
| Text     | Text     |`
          )
        }}
      >
        <Table className='h-4 w-4' />
      </Button>
      <Button
        variant={isRecording ? 'default' : 'ghost'}
        onMouseDown={(e) => {
          e.preventDefault()
          if (isRecording) {
            stopRecording()
          } else {
            startRecording()
          }
        }}
      >
        {isRecording ? (
          <MicOff className='h-4 w-4' />
        ) : (
          <Mic className='h-4 w-4' />
        )}
      </Button>
    </div>
  )
}
