import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useCampaignQueries } from '@hooks/useCampaignQueries'
import { useState } from 'react'

export default function CreateCampaign() {
  const { createCampaign } = useCampaignQueries()
  const [campaignName, setCampaignName] = useState('')
  const [open, setOpen] = useState(false)

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
        />
        {createCampaign.error && (
          <div className='mt-2 text-sm text-red-500'>
            {createCampaign.error.message}
          </div>
        )}
        <DialogFooter>
          <Button
            variant='default'
            disabled={createCampaign.isPending || !campaignName}
            onClick={async () => {
              await createCampaign.mutateAsync({ name: campaignName })
              if (!createCampaign.error) {
                setCampaignName('')
                setOpen(false)
              }
            }}
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
