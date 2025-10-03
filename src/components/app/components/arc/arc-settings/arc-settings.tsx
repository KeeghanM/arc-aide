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
import { useArcQueries } from '@hooks/useArcQueries'
import { useEffect, useState } from 'react'
import DeleteArc from './delete-arc'

/**
 * Arc Settings Component
 * Renders a dialog for editing the current arc's name and managing arc settings.
 * Also provides access to the DeleteArc component for deleting the arc.
 */
export default function ArcSettings() {
  const { modifyArc, useArcQuery } = useArcQueries()
  const { currentArc } = useAppStore()
  const arcQuery = useArcQuery(currentArc?.slug ?? '')
  const [arcName, setArcName] = useState(arcQuery.data?.name ?? '')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setArcName(arcQuery.data?.name ?? '')
  }, [arcQuery.data])

  // --- Form submission ---
  const handleSave = async () => {
    if (!arcName || !currentArc?.slug) return

    const updatedArc = await modifyArc.mutateAsync({
      updatedArc: {
        slug: currentArc?.slug,
        name: arcName,
      },
    })

    if (!modifyArc.error) {
      window.location.href = `/dashboard/arc/${updatedArc.slug}/`
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
          Arc Settings
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Arc Settings</DialogTitle>
        </DialogHeader>
        <Label>Arc Name</Label>
        <Input
          placeholder='Arc name'
          value={arcName}
          onChange={(e) => setArcName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSave()
            }
          }}
        />

        {/* Display mutation errors to user */}
        {modifyArc.error && (
          <div className='mt-2 text-sm text-red-500'>
            {modifyArc.error.message}
          </div>
        )}
        <DialogFooter>
          <DeleteArc />
          <Button
            variant='default'
            disabled={modifyArc.isPending || !arcName}
            onClick={handleSave}
          >
            {modifyArc.isPending ? 'Saving...' : 'Save'}
          </Button>
          <DialogClose asChild>
            <Button variant='outline'>Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
