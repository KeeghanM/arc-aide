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
import { useAppStore } from '@stores/appStore'
import { useState } from 'react'
import { SearchBar } from '../../search-bar/search-bar'

type TAddThingToArcProps = {
  thingSlug: string
}

/**
 * Add Thing to Arc Dialog Component
 *
 * Allows users to associate a Thing with an Arc through a searchable dialog.
 * Uses the search component for arc discovery, creating a many-to-many
 * relationship between Things and Arcs. This enables Things to appear
 * in multiple story arcs throughout the campaign.
 */
export function AddThingToArc({ thingSlug }: TAddThingToArcProps) {
  const { campaignSlug } = useAppStore()
  const { addThingToArc } = useThingQueries()
  const [arc, setArc] = useState<{ slug: string; name: string } | null>(null)
  const [open, setOpen] = useState(false)

  // --- Handle arc association ---
  const handleAdd = async () => {
    if (!campaignSlug || !arc?.slug) return

    await addThingToArc.mutateAsync({ arcSlug: arc?.slug, thingSlug })
    if (!addThingToArc.error) {
      setArc(null)
      setOpen(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
        <div className='mb-4 flex cursor-pointer items-center gap-2'>
          <p>Add to Arc</p>
          <Button
            className='size-8 rounded-full p-0'
            variant='default'
          >
            +
          </Button>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Thing to Arc</DialogTitle>
        </DialogHeader>
        <SearchBar
          showTitle={false}
          searchType='arc'
          returnType='function'
          onSelect={(result) => {
            setArc({ slug: result.entitySlug, name: result.title })
          }}
        />
        {arc ? (
          <p className='font-bold'>{arc.name}</p>
        ) : (
          <p className='text-muted-foreground text-sm'>
            Select an Arc from above
          </p>
        )}
        {addThingToArc.error && (
          <div className='mt-2 text-sm text-red-500'>
            {addThingToArc.error.message}
          </div>
        )}
        <DialogFooter>
          <Button
            variant='default'
            disabled={addThingToArc.isPending || !arc}
            onClick={handleAdd}
          >
            {addThingToArc.isPending ? 'Adding...' : 'Add'}
          </Button>
          <DialogClose asChild>
            <Button variant='outline'>Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
