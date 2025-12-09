import { Button } from '@components/ui/button'
import { type TThing, useThingQueries } from '@hooks/useThingQueries'
import { extractRelatedItems } from '@utils/slate-text-extractor'
import { useEffect, useState } from 'react'
import type { Descendant } from 'slate'
import { Publish } from '../components/publish/publish'
import {
  defaultEditorValue,
  MarkdownEditor,
} from '../components/slate-handling/editor/markdown-editor'
import { SlateViewer } from '../components/slate-handling/viewer'
import { ThingSettings } from '../components/thing/thing-settings/thing-settings'
import type { TScreenWrapperProps } from '../screen-wrapper'
import { ScreenWrapper } from '../screen-wrapper'
import { useAppStore } from '../stores/appStore'

type TThingProps = {
  thing: TThing
}

function Thing({ thing }: TThingProps) {
  const { modifyThing } = useThingQueries()
  const { mode, setCurrentThing } = useAppStore()
  const { useThingQuery } = useThingQueries()
  const thingQuery = useThingQuery(thing.slug)
  const [descriptionValue, setDesctipionValue] = useState(thing.description)

  const handleSave = async () => {
    modifyThing.mutate({
      updatedThing: { slug: thing.slug, description: descriptionValue },
      relatedItems: extractRelatedItems(descriptionValue as Descendant[]),
    })
  }

  useEffect(() => {
    setCurrentThing(thing)
  }, [thing, setCurrentThing])

  return (
    <div className='space-y-6 pr-6 md:pr-12'>
      <div className='flex items-center gap-2'>
        <ThingSettings />
        <Publish
          published={thingQuery.data?.published ?? thing.published}
          type='thing'
          slug={thing.slug}
        />
        <Button
          variant={'success'}
          onClick={handleSave}
          disabled={modifyThing.isPending}
        >
          Save
        </Button>
      </div>
      <div>
        <h2 className='mb-2 flex items-center gap-2 text-2xl font-semibold'>
          Description
        </h2>
        {mode === 'view' ? (
          <SlateViewer
            content={
              ((thingQuery.data?.description ??
                thing.description) as Descendant[]) ?? []
            }
          />
        ) : (
          <MarkdownEditor
            initialValue={
              ((thingQuery.data?.description ??
                thing.description) as Descendant[]) ?? defaultEditorValue
            }
            onChange={setDesctipionValue}
            height='lg'
          />
        )}
      </div>
    </div>
  )
}

export function ThingScreen({
  thing,
  campaignSlug,
  user,
}: TThingProps & TScreenWrapperProps) {
  return (
    <ScreenWrapper
      user={user}
      campaignSlug={campaignSlug}
    >
      <Thing {...{ thing }} />
    </ScreenWrapper>
  )
}
