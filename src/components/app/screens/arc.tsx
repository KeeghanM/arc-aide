import { type TArc, useArcQueries } from '@hooks/useArcQueries'
import pDebounce from 'p-debounce'
import type { Descendant } from 'slate'
import ArcItem from '../components/arc/arc'
import ParentArc from '../components/arc/parent-arc/parent-arc'
import MarkdownEditor, { defaultEditorValue } from '../components/editor/editor'
import type { TScreenWrapperProps } from '../screen-wrapper'
import ScreenWrapper from '../screen-wrapper'

type TArcProps = {
  arc: TArc
}

function Arc({ arc }: TArcProps) {
  const { modifyArc } = useArcQueries()

  // --- Auto-save handlers ---
  // Debounce saves to avoid excessive API calls while user types
  // 1000ms delay balances UX (not losing work) with server load
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
    <div className='space-y-4 pr-6 md:pr-12'>
      <ParentArc arc={arc} />
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        {/* 
        Arc Structure follows the D&D narrative framework:
        - Hook: What draws players in
        - Protagonist/Antagonist: Key characters driving conflict
        - Problem: Central challenge to resolve
        - Key: How players can solve it
        - Outcome: Resolution and consequences
      */}
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
          {/* 
            Type casting to Descendant[] is safe here because:
            1. Database stores JSON as TEXT, so TypeScript sees it as unknown
            2. Our schema validation ensures it's always a valid Slate AST
            3. defaultEditorValue provides fallback for null/undefined
          */}
          <MarkdownEditor
            initialValue={(arc.outcome as Descendant[]) ?? defaultEditorValue}
            onChange={handleOutcomeChange}
          />
        </div>
      </div>
      <div>
        <h2 className='mb-2 flex items-center gap-2 text-2xl font-semibold'>
          Children
        </h2>
        <div className='space-y-4'>
          {arc.childArcs && arc.childArcs.length > 0 ? (
            arc.childArcs.map((childArc) => (
              <ArcItem
                key={childArc.id}
                arc={childArc}
              />
            ))
          ) : (
            <p className='text-muted-foreground text-sm'>
              No child arcs. Create some to expand your story!
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Arc Screen Wrapper Component
 *
 * Provides the React Query context and user/campaign state needed
 * for the Arc component to function properly. This separation allows
 * the Arc component to be used in different contexts (testing, etc.)
 * while keeping the data dependencies clear.
 */
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
