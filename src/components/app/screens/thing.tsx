import { type TThing, useThingQueries } from '@hooks/useThingQueries'
import { extractRelatedItems } from '@utils/slate-text-extractor'
import pDebounce from 'p-debounce'
import type { Descendant } from 'slate'
import Publish from '../components/publish/publish'
import MarkdownEditor, {
  defaultEditorValue,
} from '../components/slate-handling/editor/markdown-editor'
import SlateViewer from '../components/slate-handling/viewer'
import ThingSettings from '../components/thing/thing-settings/thing-settings'
import type { TScreenWrapperProps } from '../screen-wrapper'
import ScreenWrapper from '../screen-wrapper'
import { useAppStore } from '../stores/appStore'

type TThingProps = {
  thing: TThing
}

function Thing({ thing }: TThingProps) {
  const { modifyThing } = useThingQueries()
  const { mode, setCurrentThing: setThingSlug } = useAppStore()
  const { useThingQuery } = useThingQueries()
  const thingQuery = useThingQuery(thing.slug)
  setThingSlug(thing)

  const handleDescriptionChange = pDebounce(async (value: Descendant[]) => {
    modifyThing.mutate({
      updatedThing: { slug: thing.slug, description: value },
      relatedItems: extractRelatedItems(value),
    })
  }, 1000)

  return (
    <div className='space-y-6 pr-6 md:pr-12'>
      <div className='flex items-center gap-2'>
        <ThingSettings />
        <Publish
          published={thingQuery.data?.published ?? thing.published}
          type='thing'
          slug={thing.slug}
        />
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
            onChange={handleDescriptionChange}
            height='lg'
          />
        )}
      </div>
    </div>
  )
}

export default function ThingScreen({
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
