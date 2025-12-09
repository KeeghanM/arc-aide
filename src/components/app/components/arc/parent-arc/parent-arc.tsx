import { type TArc, useArcQueries } from '@components/app/hooks/useArcQueries'
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
import { useState } from 'react'
import { SearchBar } from '../../search-bar/search-bar'

type TParentArcProps = {
  arc: TArc
}

/**
 * Parent Arc Component
 * This acts as both the link to a parent arc, if one exists, and the dialog
 * to add the current arc to an arc. It uses a search bar to find and select
 * an arc, creating a parent-child relationship between arcs.
 */
export function ParentArc({ arc }: TParentArcProps) {
  const { campaignSlug } = useAppStore()
  const { modifyArc } = useArcQueries()
  const [parentArc, setParentArc] = useState<TArc | undefined>(arc.parentArc)

  const [open, setOpen] = useState(false)
  const [selectedParentArc, setSelectedParentArc] = useState<{
    id: number
    name: string
  } | null>(null)

  // --- Handle arc association ---
  const handleAdd = async () => {
    if (!selectedParentArc) return
    const updatedArc = await modifyArc.mutateAsync({
      updatedArc: { slug: arc.slug, parentArcId: selectedParentArc.id },
    })

    if (!modifyArc.error) {
      setParentArc(updatedArc.parentArc)
      setOpen(false)
    }
  }

  // When we have a parent arc, show the link to it
  if (parentArc) {
    return (
      <div className='mb-4 flex items-center gap-2 text-lg font-semibold underline'>
        <a href={`/dashboard/campaign/${campaignSlug}/arc/${parentArc.slug}/`}>
          Parent Arc: {parentArc.name}
        </a>
      </div>
    )
  }

  // When we don't have a parent arc, show the dialog to add one
  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
        <div className='mb-4 flex max-w-fit cursor-pointer items-center gap-2'>
          <p>Set Parent Arc</p>
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
          <DialogTitle>Select Parent Arc</DialogTitle>
        </DialogHeader>
        <SearchBar
          showTitle={false}
          searchType='arc'
          returnType='function'
          onSelect={(result) => {
            setSelectedParentArc({
              id: result.entityId,
              name: result.title,
            })
          }}
        />
        {selectedParentArc ? (
          <p className='font-bold'>{selectedParentArc.name}</p>
        ) : (
          <p className='text-muted-foreground text-sm'>
            Select an Arc from above
          </p>
        )}
        {modifyArc.error && (
          <div className='mt-2 text-sm text-red-500'>
            {modifyArc.error.message}
          </div>
        )}
        <DialogFooter>
          <Button
            variant='default'
            disabled={modifyArc.isPending || !arc}
            onClick={handleAdd}
          >
            {modifyArc.isPending ? 'Adding...' : 'Add'}
          </Button>
          <DialogClose asChild>
            <Button variant='outline'>Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
