import { Button } from '@components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@components/ui/dialog'
import { Input } from '@components/ui/input'
import { useArcQueries } from '@hooks/useArcQueries'
import { useState } from 'react'

export function CreateArc() {
  const { createArc } = useArcQueries()
  const [arcName, setArcName] = useState('')
  const [open, setOpen] = useState(false)

  const handleCreate = async () => {
    await createArc.mutateAsync({ newArc: { name: arcName } })
    if (!createArc.error) {
      setArcName('')
      setOpen(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
        <Button
          className='size-8 rounded-full p-0'
          variant='default'
        >
          +
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new Arc</DialogTitle>
        </DialogHeader>
        <Input
          placeholder='Arc name'
          value={arcName}
          onChange={(e) => setArcName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !createArc.isPending && arcName) {
              handleCreate()
            }
          }}
        />
        {createArc.error && (
          <div className='mt-2 text-sm text-red-500'>
            {createArc.error.message}
          </div>
        )}
        <DialogFooter>
          <Button
            variant='default'
            disabled={createArc.isPending || !arcName}
            onClick={handleCreate}
          >
            {createArc.isPending ? 'Creating...' : 'Create'}
          </Button>
          <DialogClose asChild>
            <Button variant='outline'>Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
