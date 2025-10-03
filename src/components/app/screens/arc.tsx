import { type TArc, useArcQueries } from '@hooks/useArcQueries'
import { useAppStore } from '@stores/appStore'
import { extractRelatedItems } from '@utils/slate-text-extractor'
import pDebounce from 'p-debounce'
import { useEffect } from 'react'
import type { Descendant } from 'slate'
import ArcItem from '../components/arc/arc-item'
import ArcSettings from '../components/arc/arc-settings/arc-settings'
import ParentArc from '../components/arc/parent-arc/parent-arc'
import Publish from '../components/publish/publish'
import MarkdownEditor, {
  defaultEditorValue,
} from '../components/slate-handling/editor/markdown-editor'
import SlateViewer from '../components/slate-handling/viewer'
import type { TScreenWrapperProps } from '../screen-wrapper'
import ScreenWrapper from '../screen-wrapper'

type TArcProps = {
  arc: TArc
}

function Arc({ arc }: TArcProps) {
  const { modifyArc, useArcQuery } = useArcQueries()
  const { mode, setCurrentArc } = useAppStore()
  const arcQuery = useArcQuery(arc.slug)

  useEffect(() => {
    setCurrentArc(arc)
  }, [arc, setCurrentArc])

  const DEBOUNCE_DELAY = 300
  // --- Auto-save handlers ---
  // Debounce saves to avoid excessive API calls while user types
  const handleHookChange = pDebounce(async (value: Descendant[]) => {
    modifyArc.mutate({
      updatedArc: { slug: arc.slug, hook: value },
      relatedItems: extractRelatedItems(value),
    })
  }, DEBOUNCE_DELAY)
  const handleProtagonistChange = pDebounce(async (value: Descendant[]) => {
    modifyArc.mutate({
      updatedArc: { slug: arc.slug, protagonist: value },
      relatedItems: extractRelatedItems(value),
    })
  }, DEBOUNCE_DELAY)
  const handleAntagonistChange = pDebounce(async (value: Descendant[]) => {
    modifyArc.mutate({
      updatedArc: { slug: arc.slug, antagonist: value },
      relatedItems: extractRelatedItems(value),
    })
  }, DEBOUNCE_DELAY)
  const handleProblemChange = pDebounce(async (value: Descendant[]) => {
    modifyArc.mutate({
      updatedArc: { slug: arc.slug, problem: value },
      relatedItems: extractRelatedItems(value),
    })
  }, DEBOUNCE_DELAY)
  const handleKeyChange = pDebounce(async (value: Descendant[]) => {
    modifyArc.mutate({
      updatedArc: { slug: arc.slug, key: value },
      relatedItems: extractRelatedItems(value),
    })
  }, DEBOUNCE_DELAY)
  const handleOutcomeChange = pDebounce(async (value: Descendant[]) => {
    modifyArc.mutate({
      updatedArc: { slug: arc.slug, outcome: value },
      relatedItems: extractRelatedItems(value),
    })
  }, DEBOUNCE_DELAY)
  const handleNotesChange = pDebounce(async (value: Descendant[]) => {
    modifyArc.mutate({
      updatedArc: { slug: arc.slug, notes: value },
      relatedItems: extractRelatedItems(value),
    })
  }, DEBOUNCE_DELAY)

  return (
    <div className='space-y-4 pr-6 md:pr-12'>
      <ParentArc arc={arc} />
      <div className='flex items-center gap-2'>
        <ArcSettings />
        <Publish
          published={arcQuery.data?.published ?? arc.published}
          type='arc'
          slug={arc.slug}
        />
      </div>
      <div className='space-y-4'>
        {/* 
        Arc Structure follows the D&D narrative framework:
        - Hook: What draws players in
        - Protagonist/Antagonist: Key characters driving conflict
        - Problem: Central challenge to resolve
        - Key: How players can solve it
        - Outcome: Resolution and consequences
      */}
        {mode === 'view' ? (
          <SlateViewer
            content={[
              {
                type: 'paragraph',
                children: [{ text: '# Hook' }],
              },
              ...(((arcQuery.data?.hook ?? arc.hook) as Descendant[]) ??
                defaultEditorValue),
              {
                type: 'paragraph',
                children: [{ text: '# Protagonist' }],
              },
              ...(((arcQuery.data?.protagonist ??
                arc.protagonist) as Descendant[]) ?? defaultEditorValue),
              {
                type: 'paragraph',
                children: [{ text: '# Antagonist' }],
              },
              ...(((arcQuery.data?.antagonist ??
                arc.antagonist) as Descendant[]) ?? defaultEditorValue),
              {
                type: 'paragraph',
                children: [{ text: '# Problem' }],
              },
              ...(((arcQuery.data?.problem ?? arc.problem) as Descendant[]) ??
                defaultEditorValue),
              {
                type: 'paragraph',
                children: [{ text: '# Key' }],
              },
              ...(((arcQuery.data?.key ?? arc.key) as Descendant[]) ??
                defaultEditorValue),
              {
                type: 'paragraph',
                children: [{ text: '# Outcome' }],
              },
              ...(((arcQuery.data?.outcome ?? arc.outcome) as Descendant[]) ??
                defaultEditorValue),
              { type: 'paragraph', children: [{ text: '# Notes' }] },
              ...(((arcQuery.data?.notes ?? arc.notes) as Descendant[]) ??
                defaultEditorValue),
            ]}
          />
        ) : (
          <>
            <div>
              <h2 className='mb-2 flex items-center gap-2 text-2xl font-semibold'>
                Hook
              </h2>
              <MarkdownEditor
                initialValue={
                  ((arcQuery.data?.hook ?? arc.hook) as Descendant[]) ??
                  defaultEditorValue
                }
                onChange={handleHookChange}
              />
            </div>
            <div>
              <h2 className='mb-2 flex items-center gap-2 text-2xl font-semibold'>
                Protagonist
              </h2>
              <MarkdownEditor
                initialValue={
                  ((arcQuery.data?.protagonist ??
                    arc.protagonist) as Descendant[]) ?? defaultEditorValue
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
                  ((arcQuery.data?.antagonist ??
                    arc.antagonist) as Descendant[]) ?? defaultEditorValue
                }
                onChange={handleAntagonistChange}
              />
            </div>
            <div>
              <h2 className='mb-2 flex items-center gap-2 text-2xl font-semibold'>
                Problem
              </h2>
              <MarkdownEditor
                initialValue={
                  ((arcQuery.data?.problem ?? arc.problem) as Descendant[]) ??
                  defaultEditorValue
                }
                onChange={handleProblemChange}
              />
            </div>
            <div>
              <h2 className='mb-2 flex items-center gap-2 text-2xl font-semibold'>
                Key
              </h2>
              <MarkdownEditor
                initialValue={
                  ((arcQuery.data?.key ?? arc.key) as Descendant[]) ??
                  defaultEditorValue
                }
                onChange={handleKeyChange}
              />
            </div>
            <div>
              <h2 className='mb-2 flex items-center gap-2 text-2xl font-semibold'>
                Outcome
              </h2>
              <MarkdownEditor
                initialValue={
                  ((arcQuery.data?.outcome ?? arc.outcome) as Descendant[]) ??
                  defaultEditorValue
                }
                onChange={handleOutcomeChange}
              />
            </div>
            <div className='md:col-span-2'>
              <h2 className='mb-2 flex items-center gap-2 text-2xl font-semibold'>
                Notes
              </h2>
              <MarkdownEditor
                initialValue={
                  ((arcQuery.data?.notes ?? arc.notes) as Descendant[]) ??
                  defaultEditorValue
                }
                onChange={handleNotesChange}
              />
            </div>
          </>
        )}
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
