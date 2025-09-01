import { type TThing, useThingQueries } from '@hooks/useThingQueries'
import pDebounce from 'p-debounce'
import type { Descendant } from 'slate'
import MarkdownEditor, {
  defaultEditorValue,
} from '../components/slate-handling/editor/markdown-editor'
import SlateViewer from '../components/slate-handling/viewer'
import type { TScreenWrapperProps } from '../screen-wrapper'
import ScreenWrapper from '../screen-wrapper'
import { useAppStore } from '../stores/appStore'

type TThingProps = {
  thing: TThing
}

function Thing({ thing }: TThingProps) {
  const { modifyThing } = useThingQueries()
  const { mode } = useAppStore()
  const { useThingQuery } = useThingQueries()
  const thingQuery = useThingQuery(thing.slug)

  const handleDescriptionChange = pDebounce(async (value: Descendant[]) => {
    modifyThing.mutate({
      updatedThing: { slug: thing.slug, description: value },
    })
  }, 1000)

  return (
    <div className='space-y-6 pr-6 md:pr-12'>
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
