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
import {
  type TThingType,
  useThingTypeQueries,
} from '@hooks/useThingTypeQueries'
import { Pencil } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ThingTypeSettings({ thingType }: { thingType: TThingType }) {
  const { modifyThingType, useThingTypeQuery } = useThingTypeQueries()
  const { campaignSlug } = useAppStore()
  const thingTypeQuery = useThingTypeQuery(campaignSlug ?? '', thingType.id)
  const [thingName, setThingName] = useState(thingTypeQuery.data?.name ?? '')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setThingName(thingTypeQuery.data?.name ?? '')
  }, [thingTypeQuery.data])

  // --- Form submission ---
  const handleSave = async () => {
    if (!thingName || !campaignSlug) return

    await modifyThingType.mutateAsync({
      campaignSlug,
      updatedThingType: {
        id: thingType.id,
        name: thingName,
      },
    })

    if (!modifyThingType.error) setOpen(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
        <Button
          className='m-0 p-0'
          variant='ghost'
          aria-label={`Edit ${thingType.name} settings`}
        >
          <Pencil />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thing Type Settings</DialogTitle>
        </DialogHeader>
        <Label htmlFor='thing-type-name'>Thing Type Name</Label>
        <Input
          id='thing-type-name'
          placeholder='Thing Type name'
          value={thingName}
          onChange={(e) => setThingName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSave()
            }
          }}
        />

        {/* Display mutation errors to user */}
        {modifyThingType.error && (
          <div className='mt-2 text-sm text-red-500'>
            {modifyThingType.error.message.includes('duplicate')
              ? 'A thing type with this name already exists.'
              : 'Failed to save changes. Please try again.'}
          </div>
        )}
        <DialogFooter>
          <Button
            variant='default'
            disabled={modifyThingType.isPending || !thingName}
            onClick={handleSave}
          >
            {modifyThingType.isPending ? 'Saving...' : 'Save'}
          </Button>
          <DialogClose asChild>
            <Button variant='outline'>Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
