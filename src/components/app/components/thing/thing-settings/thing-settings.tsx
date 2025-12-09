import { useAppStore } from '@components/app/stores/appStore'
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
import { Label } from '@components/ui/label'
import { useThingQueries } from '@hooks/useThingQueries'
import { useEffect, useState } from 'react'
import DeleteThing from './delete-thing'

/**
 * Delete Thing Component
 * Renders a button that opens a confirmation dialog to delete the current thing.
 * Uses useThingQueries hook to perform the deletion and manage state.
 */
export function ThingSettings() {
  const { modifyThing, useThingQuery } = useThingQueries()
  const { currentThing } = useAppStore()
  const thingQuery = useThingQuery(currentThing?.slug ?? '')
  const [thingName, setThingName] = useState(thingQuery.data?.name ?? '')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setThingName(thingQuery.data?.name ?? '')
  }, [thingQuery.data])

  // --- Form submission ---
  const handleSave = async () => {
    if (!thingName || !currentThing?.slug) return

    const updatedThing = await modifyThing.mutateAsync({
      updatedThing: {
        slug: currentThing?.slug,
        name: thingName,
      },
    })
    if (!modifyThing.error) {
      window.location.href = `/dashboard/thing/${updatedThing.slug}/`
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
          className='m-0 p-0'
          variant='link'
        >
          Thing Settings
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thing Settings</DialogTitle>
        </DialogHeader>
        <Label>Thing Name</Label>
        <Input
          placeholder='Thing name'
          value={thingName}
          onChange={(e) => setThingName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSave()
            }
          }}
        />

        {/* Display mutation errors to user */}
        {modifyThing.error && (
          <div className='mt-2 text-sm text-red-500'>
            {modifyThing.error.message}
          </div>
        )}
        <DialogFooter>
          <DeleteThing />
          <Button
            variant='default'
            disabled={modifyThing.isPending || !thingName}
            onClick={handleSave}
          >
            {modifyThing.isPending ? 'Saving...' : 'Save'}
          </Button>
          <DialogClose asChild>
            <Button variant='outline'>Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
