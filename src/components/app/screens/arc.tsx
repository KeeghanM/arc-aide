import pDebounce from 'p-debounce'
import type { Descendant } from 'slate'
import MarkdownEditor, { defaultEditorValue } from '../components/editor/editor'
import SearchBar from '../components/search-bar/search-bar'
import { useArcQueries, type TArc } from '../hooks/useArcQueries'
import type { TScreenWrapperProps } from '../screen-wrapper'
import ScreenWrapper from '../screen-wrapper'

type TArcProps = {
  arc: TArc
}

function Arc({ arc }: TArcProps) {
  const { modifyArc } = useArcQueries()
  const handleHookChange = pDebounce(async (value: Descendant[]) => {
    modifyArc.mutate({ updatedArc: { slug: arc.slug, hook: value } })
  }, 1000)
  const handleProtagonistChange = pDebounce(async (value: Descendant[]) => {
    modifyArc.mutate({ updatedArc: { slug: arc.slug, protagonist: value } })
  }, 1000)
  const handleAntagonistChange = pDebounce(async (value: Descendant[]) => {
    modifyArc.mutate({ updatedArc: { slug: arc.slug, antagonist: value } })
  }, 1000)
  const handleProblemChange = pDebounce(async (value: Descendant[]) => {
    modifyArc.mutate({ updatedArc: { slug: arc.slug, problem: value } })
  }, 1000)
  const handleKeyChange = pDebounce(async (value: Descendant[]) => {
    modifyArc.mutate({ updatedArc: { slug: arc.slug, key: value } })
  }, 1000)
  const handleOutcomeChange = pDebounce(async (value: Descendant[]) => {
    modifyArc.mutate({ updatedArc: { slug: arc.slug, outcome: value } })
  }, 1000)

  return (
    <div className='space-y-6 pr-6 md:pr-12'>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div>
          <h2 className='mb-2 flex items-center gap-2 text-2xl font-semibold'>
            Hook
          </h2>
          <MarkdownEditor
            initialValue={(arc.hook as Descendant[]) ?? defaultEditorValue}
            onChange={handleHookChange}
          />
        </div>
        <div>
          <h2 className='mb-2 flex items-center gap-2 text-2xl font-semibold'>
            Protagonist
          </h2>
          <MarkdownEditor
            initialValue={
              (arc.protagonist as Descendant[]) ?? defaultEditorValue
            }
            onChange={handleProtagonistChange}
          />
        </div>
        <div>
          <h2 className='mb-2 flex items-center gap-2 text-2xl font-semibold'>
            Antagonist
          </h2>
          <MarkdownEditor
            initialValue={
              (arc.antagonist as Descendant[]) ?? defaultEditorValue
            }
            onChange={handleAntagonistChange}
          />
        </div>
        <div>
          <h2 className='mb-2 flex items-center gap-2 text-2xl font-semibold'>
            Problem
          </h2>
          <MarkdownEditor
            initialValue={(arc.problem as Descendant[]) ?? defaultEditorValue}
            onChange={handleProblemChange}
          />
        </div>
        <div>
          <h2 className='mb-2 flex items-center gap-2 text-2xl font-semibold'>
            Key
          </h2>
          <MarkdownEditor
            initialValue={(arc.key as Descendant[]) ?? defaultEditorValue}
            onChange={handleKeyChange}
          />
        </div>
        <div>
          <h2 className='mb-2 flex items-center gap-2 text-2xl font-semibold'>
            Outcome
          </h2>
          <MarkdownEditor
            initialValue={(arc.outcome as Descendant[]) ?? defaultEditorValue}
            onChange={handleOutcomeChange}
          />
        </div>
      </div>
      <SearchBar />
    </div>
  )
}

export default function ArcScreen({
  arc,
  campaignSlug,
  user,
}: TArcProps & TScreenWrapperProps) {
  return (
    <ScreenWrapper
      user={user}
      campaignSlug={campaignSlug}
    >
      <Arc {...{ arc }} />
    </ScreenWrapper>
  )
}
