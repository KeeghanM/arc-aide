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
import { useThingQueries } from '@hooks/useThingQueries'
import { useState } from 'react'

/**
 * Delete Thing Component
 * Renders a button that opens a confirmation dialog to delete the current Thing.
 * Uses useThingQueries hook to perform the deletion and manage state.
 */
export default function DeleteThing() {
  const { deleteThing } = useThingQueries()
  const { currentThing } = useAppStore()
  const [open, setOpen] = useState(false)

  // --- Form submission ---
  const handleDelete = async () => {
    if (!currentThing?.slug) return

    await deleteThing.mutateAsync({ thingSlug: currentThing.slug })
    // Only clear form and close dialog on success
    if (!deleteThing.error) {
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
          className='mt-auto mr-auto'
          variant='destructive'
        >
          Delete Thing
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure you want to delete this thing?</DialogTitle>
        </DialogHeader>
        {/* Display mutation errors to user */}
        {deleteThing.error && (
          <div className='mt-2 text-sm text-red-500'>
            {deleteThing.error.message}
          </div>
        )}
        <DialogFooter>
          <Button
            variant='destructive'
            disabled={deleteThing.isPending}
            onClick={handleDelete}
          >
            {deleteThing.isPending ? 'Deleting...' : 'Delete'}
          </Button>
          <DialogClose asChild>
            <Button variant='outline'>Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
