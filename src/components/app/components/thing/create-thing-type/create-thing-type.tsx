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
import { useThingTypeQueries } from '@hooks/useThingTypeQueries'
import { useAppStore } from '@stores/appStore'
import { useState } from 'react'

export function CreateThingType() {
  const { campaignSlug } = useAppStore()
  const { createThingType } = useThingTypeQueries()
  const [thingTypeName, setThingTypeName] = useState('')
  const [open, setOpen] = useState(false)

  const handleCreate = async () => {
    if (!campaignSlug || !thingTypeName) return

    await createThingType.mutateAsync({
      campaignSlug,
      newThingType: { name: thingTypeName },
    })
    if (!createThingType.error) {
      setThingTypeName('')
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
          <DialogTitle>Create a new ThingType</DialogTitle>
        </DialogHeader>
        <Input
          placeholder='ThingType name'
          value={thingTypeName}
          onChange={(e) => setThingTypeName(e.target.value)}
          onKeyDown={(e) => {
            if (
              e.key === 'Enter' &&
              !createThingType.isPending &&
              thingTypeName
            ) {
              handleCreate()
            }
          }}
        />
        {createThingType.error && (
          <div className='mt-2 text-sm text-red-500'>
            {createThingType.error.message}
          </div>
        )}
        <DialogFooter>
          <Button
            variant='default'
            disabled={createThingType.isPending || !thingTypeName}
            onClick={handleCreate}
          >
            {createThingType.isPending ? 'Creating...' : 'Create'}
          </Button>
          <DialogClose asChild>
            <Button variant='outline'>Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
