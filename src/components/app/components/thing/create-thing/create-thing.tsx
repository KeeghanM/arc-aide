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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select'
import { useThingQueries } from '@hooks/useThingQueries'
import { useThingTypeQueries } from '@hooks/useThingTypeQueries'
import { useAppStore } from '@stores/appStore'
import { useState } from 'react'
import CreateThingType from '../create-thing-type/create-thing-type'

/**
 * Create Thing Dialog Component
 *
 * Modal for creating new campaign "Things" (characters, locations, items, etc.).
 * Requires selecting a Thing Type first, which categorizes the entity.
 * Includes inline Thing Type creation for better UX flow.
 */
export default function CreateThing() {
  const { campaignSlug } = useAppStore()
  const { useThingTypesQuery } = useThingTypeQueries()
  const thingTypes = useThingTypesQuery(campaignSlug!)

  const { createThing } = useThingQueries()

  const [thingName, setThingName] = useState('')
  const [typeId, setTypeId] = useState<number | null>(null)
  const [open, setOpen] = useState(false)

  // --- Form validation and submission ---
  const handleCreate = async () => {
    // Both name and type are required for Thing creation
    if (!thingName || typeId === null) return

    await createThing.mutateAsync({ newThing: { name: thingName, typeId } })
    if (!createThing.error) {
      setThingName('')
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
          <DialogTitle>Create a new Thing</DialogTitle>
        </DialogHeader>
        {/* 
          Thing Type selection with inline creation option.
          Users can create new types without leaving this dialog.
        */}
        <div className='flex items-center gap-2'>
          <Select
            disabled={
              thingTypes.isPending ||
              thingTypes.data === undefined ||
              thingTypes.data.length === 0
            }
            value={typeId?.toString() || ''}
            onValueChange={(value) => setTypeId(Number(value))}
          >
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder='Select Type' />
            </SelectTrigger>
            <SelectContent>
              {thingTypes.data?.map((type) => (
                <SelectItem
                  key={type.id}
                  value={type.id.toString()}
                  onSelect={() => setTypeId(type.id)}
                >
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <CreateThingType />
        </div>
        <Input
          placeholder='Thing name'
          value={thingName}
          onChange={(e) => setThingName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !createThing.isPending && thingName) {
              handleCreate()
            }
          }}
        />
        {createThing.error && (
          <div className='mt-2 text-sm text-red-500'>
            {createThing.error.message}
          </div>
        )}
        <DialogFooter>
          <Button
            variant='default'
            disabled={createThing.isPending || !thingName || typeId === null}
            onClick={handleCreate}
          >
            {createThing.isPending ? 'Creating...' : 'Create'}
          </Button>
          <DialogClose asChild>
            <Button variant='outline'>Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
