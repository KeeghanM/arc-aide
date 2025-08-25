import MarkdownEditor, {
  defaultEditorValue,
} from '@components/app/components/editor/editor'
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
import { useCampaignQueries } from '@hooks/useCampaignQueries'
import { useEffect, useState } from 'react'
import type { Descendant } from 'slate'
import DeleteCampaign from './delete-campaign'

/**
 * Delete Campaign Component
 * Renders a button that opens a confirmation dialog to delete the current campaign.
 * Uses useCampaignQueries hook to perform the deletion and manage state.
 */
export default function CampaignSettings() {
  const { campaignSlug } = useAppStore()
  const { modifyCampaign, useCampaignQuery } = useCampaignQueries()
  const campaignQuery = useCampaignQuery(campaignSlug ?? '')
  const [campaignName, setCampaignName] = useState(
    campaignQuery.data?.name ?? ''
  )
  const [campaignDescription, setCampaignDescription] = useState<Descendant[]>(
    (campaignQuery.data?.description as Descendant[]) ?? defaultEditorValue
  )
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (campaignQuery.data?.name) {
      setCampaignName(campaignQuery.data.name)
    }
    if (campaignQuery.data?.description) {
      setCampaignDescription(
        (campaignQuery.data.description as Descendant[]) ?? defaultEditorValue
      )
    }
  }, [campaignQuery.data, campaignSlug])

  // --- Form submission ---
  const handleSave = async () => {
    if (!campaignSlug || !campaignName) return

    await modifyCampaign.mutateAsync({
      campaignSlug,
      name: campaignName,
      description: campaignDescription,
    })

    if (!modifyCampaign.error) {
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
          Campaign Settings
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Campaign Settings</DialogTitle>
        </DialogHeader>
        <Input
          placeholder='Campaign name'
          value={campaignName}
          onChange={(e) => setCampaignName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSave()
            }
          }}
        />
        <MarkdownEditor
          initialValue={campaignDescription ?? defaultEditorValue}
          onChange={setCampaignDescription}
        />
        {/* Display mutation errors to user */}
        {modifyCampaign.error && (
          <div className='mt-2 text-sm text-red-500'>
            {modifyCampaign.error.message}
          </div>
        )}
        <DialogFooter>
          <DeleteCampaign />
          <Button
            variant='default'
            disabled={modifyCampaign.isPending || !campaignName}
            onClick={handleSave}
          >
            {modifyCampaign.isPending ? 'Saving...' : 'Save'}
          </Button>
          <DialogClose asChild>
            <Button variant='outline'>Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
