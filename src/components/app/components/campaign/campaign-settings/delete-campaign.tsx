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
import { useCampaignQueries } from '@hooks/useCampaignQueries'
import { useState } from 'react'

/**
 * Delete Campaign Component
 * Renders a button that opens a confirmation dialog to delete the current campaign.
 * Uses useCampaignQueries hook to perform the deletion and manage state.
 */
export default function DeleteCampaign() {
  const { deleteCampaign } = useCampaignQueries()
  const { campaignSlug } = useAppStore()
  const [open, setOpen] = useState(false)

  // --- Form submission ---
  const handleDelete = async () => {
    if (!campaignSlug) return

    await deleteCampaign.mutateAsync(campaignSlug)
    // Only clear form and close dialog on success
    if (!deleteCampaign.error) {
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
          className='mt-auto'
          variant='destructive'
        >
          Delete Campaign
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Are you sure you want to delete this campaign?
          </DialogTitle>
        </DialogHeader>
        {/* Display mutation errors to user */}
        {deleteCampaign.error && (
          <div className='mt-2 text-sm text-red-500'>
            {deleteCampaign.error.message}
          </div>
        )}
        <DialogFooter>
          <Button
            variant='destructive'
            disabled={deleteCampaign.isPending}
            onClick={handleDelete}
          >
            {deleteCampaign.isPending ? 'Deleting...' : 'Delete'}
          </Button>
          <DialogClose asChild>
            <Button variant='outline'>Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
