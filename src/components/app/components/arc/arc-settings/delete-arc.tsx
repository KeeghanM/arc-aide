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
import { useArcQueries } from '@hooks/useArcQueries'
import { useState } from 'react'

/**
 * Delete Arc Component
 * Renders a button that opens a confirmation dialog to delete the current Arc.
 * Uses useArcQueries hook to perform the deletion and manage state.
 */
export function DeleteArc() {
  const { deleteArc } = useArcQueries()
  const { currentArc, campaignSlug } = useAppStore()
  const [open, setOpen] = useState(false)

  // --- Form submission ---
  const handleDelete = async () => {
    if (!currentArc?.slug) return

    await deleteArc.mutateAsync({ arcSlug: currentArc.slug })
    // Only clear form and close dialog on success
    if (!deleteArc.error) {
      setOpen(false)
      window.location.href = `/dashboard/campaign/${campaignSlug}/`
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
          Delete Arc
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure you want to delete this arc?</DialogTitle>
        </DialogHeader>
        {/* Display mutation errors to user */}
        {deleteArc.error && (
          <div className='mt-2 text-sm text-red-500'>
            {deleteArc.error.message}
          </div>
        )}
        <DialogFooter>
          <Button
            variant='destructive'
            disabled={deleteArc.isPending}
            onClick={handleDelete}
          >
            {deleteArc.isPending ? 'Deleting...' : 'Delete'}
          </Button>
          <DialogClose asChild>
            <Button variant='outline'>Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
