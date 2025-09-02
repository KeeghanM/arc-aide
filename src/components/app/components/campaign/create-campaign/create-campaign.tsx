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
import PremiumPrompt from '@components/ui/premium-prompt'
import { useCampaignQueries } from '@hooks/useCampaignQueries'
import { useSubscriptionQueries } from '@hooks/useSubscriptionQueries'
import { useState } from 'react'

/**
 * Create Campaign Dialog Component
 *
 * Modal dialog for creating new D&D campaigns. Uses optimistic updates
 * and automatically closes on successful creation. The campaign name
 * becomes the primary identifier and navigation slug.
 */
export default function CreateCampaign() {
  const { createCampaign, campaignsQuery } = useCampaignQueries()
  const [campaignName, setCampaignName] = useState('')
  const [open, setOpen] = useState(false)
  const { features } = useSubscriptionQueries()

  // --- Form submission ---
  const handleCreate = async () => {
    await createCampaign.mutateAsync({ name: campaignName })
    // Only clear form and close dialog on success
    if (!createCampaign.error) {
      setCampaignName('')
      setOpen(false)
    }
  }

  if (
    !features?.hasPremium &&
    campaignsQuery.data &&
    campaignsQuery.data?.length >= 1
  )
    return (
      <PremiumPrompt
        trigger={
          <Button
            className='mt-auto'
            variant='default'
          >
            Create Campaign
          </Button>
        }
        onClose={() => setOpen(false)}
      >
        <p>Having multiple campaigns is for our premium members only. </p>
        <p>
          We want to offer as many features as we can for free, and one of the
          most expensive parts of running the site is storage space.
        </p>
        <p>
          If you&apos;d like to support the project and gain access to multiple
          campaigns, please consider upgrading to a premium account.
        </p>
      </PremiumPrompt>
    )

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
        <Button
          className='mt-auto'
          variant='default'
        >
          Create Campaign
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new campaign</DialogTitle>
        </DialogHeader>
        <Input
          placeholder='Campaign name'
          value={campaignName}
          onChange={(e) => setCampaignName(e.target.value)}
          onKeyDown={(e) => {
            // Allow Enter key submission when form is valid
            if (
              e.key === 'Enter' &&
              !createCampaign.isPending &&
              campaignName
            ) {
              handleCreate()
            }
          }}
        />
        {/* Display mutation errors to user */}
        {createCampaign.error && (
          <div className='mt-2 text-sm text-red-500'>
            {createCampaign.error.message}
          </div>
        )}
        <DialogFooter>
          <Button
            variant='default'
            disabled={createCampaign.isPending || !campaignName}
            onClick={handleCreate}
          >
            {createCampaign.isPending ? 'Creating...' : 'Create'}
          </Button>
          <DialogClose asChild>
            <Button variant='outline'>Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
