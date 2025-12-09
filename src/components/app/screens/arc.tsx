import { Button } from '@components/ui/button'
import { type TArc, useArcQueries } from '@hooks/useArcQueries'
import { useAppStore } from '@stores/appStore'
import { extractRelatedItems } from '@utils/slate-text-extractor'
import { useEffect, useState } from 'react'
import type { Descendant } from 'slate'
import { ArcItem } from '../components/arc/arc-item'
import { ArcSettings } from '../components/arc/arc-settings/arc-settings'
import { ParentArc } from '../components/arc/parent-arc/parent-arc'
import { Publish } from '../components/publish/publish'
import {
  defaultEditorValue,
  MarkdownEditor,
} from '../components/slate-handling/editor/markdown-editor'
import { SlateViewer } from '../components/slate-handling/viewer'
import type { TScreenWrapperProps } from '../screen-wrapper'
import { ScreenWrapper } from '../screen-wrapper'

type TArcProps = {
  arc: TArc
}

function Arc({ arc }: TArcProps) {
  const { modifyArc, useArcQuery } = useArcQueries()
  const { mode, setCurrentArc } = useAppStore()
  const arcQuery = useArcQuery(arc.slug)
  const [hookValue, setHookValue] = useState(arc.hook)
  const [protagonistValue, setProtagonistValue] = useState(arc.protagonist)
  const [antagonistValue, setAntagonistValue] = useState(arc.antagonist)
  const [problemValue, setProblemValue] = useState(arc.problem)
  const [keyValue, setKeyValue] = useState(arc.key)
  const [outcomeValue, setOutcomeValue] = useState(arc.outcome)
  const [notesValue, setNotesValue] = useState(arc.notes)

  useEffect(() => {
    setCurrentArc(arc)
  }, [arc, setCurrentArc])

  const handleSave = async () => {
    const updatedArc: Partial<TArc> & { slug: string } = {
      slug: arc.slug,
    }

    if (JSON.stringify(hookValue) !== JSON.stringify(arc.hook)) {
      updatedArc.hook = hookValue
    }
    if (JSON.stringify(protagonistValue) !== JSON.stringify(arc.protagonist)) {
      updatedArc.protagonist = protagonistValue
    }
    if (JSON.stringify(antagonistValue) !== JSON.stringify(arc.antagonist)) {
      updatedArc.antagonist = antagonistValue
    }
    if (JSON.stringify(problemValue) !== JSON.stringify(arc.problem)) {
      updatedArc.problem = problemValue
    }
    if (JSON.stringify(keyValue) !== JSON.stringify(arc.key)) {
      updatedArc.key = keyValue
    }
    if (JSON.stringify(outcomeValue) !== JSON.stringify(arc.outcome)) {
      updatedArc.outcome = outcomeValue
    }
    if (JSON.stringify(notesValue) !== JSON.stringify(arc.notes)) {
      updatedArc.notes = notesValue
    }

    modifyArc.mutate({
      updatedArc,
      relatedItems: [
        ...extractRelatedItems(hookValue as Descendant[]),
        ...extractRelatedItems(protagonistValue as Descendant[]),
        ...extractRelatedItems(antagonistValue as Descendant[]),
        ...extractRelatedItems(problemValue as Descendant[]),
        ...extractRelatedItems(keyValue as Descendant[]),
        ...extractRelatedItems(outcomeValue as Descendant[]),
        ...extractRelatedItems(notesValue as Descendant[]),
      ],
    })
  }

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
        <Button
          variant={'success'}
          onClick={handleSave}
          disabled={modifyArc.isPending}
        >
          Save
        </Button>
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
                onChange={setHookValue}
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
                onChange={setProtagonistValue}
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
                onChange={setAntagonistValue}
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
                onChange={setProblemValue}
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
                onChange={setKeyValue}
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
                onChange={setOutcomeValue}
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
                onChange={setNotesValue}
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
export function ArcScreen({
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
