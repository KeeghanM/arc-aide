import type { TArc } from '@hooks/useArcQueries'
import type { TThing } from '@hooks/useThingQueries'
import type { TThingType } from '@hooks/useThingTypeQueries'
import { cn } from '@lib/utils/cn'
import { useAppStore } from '@stores/appStore'
import { useState } from 'react'

type TArcItemProps = {
  arc: TArc
  allArcs: TArc[]
  thingTypesData?: TThingType[]
  level?: number
}

export default function ArcItem({
  arc,
  allArcs,
  thingTypesData,
  level = 0,
}: TArcItemProps) {
  const { campaignSlug } = useAppStore()
  const [isExpanded, setIsExpanded] = useState(false)

  // Find child arcs for this arc
  const childArcs = allArcs.filter(
    (childArc) => childArc.parentArcId === arc.id
  )
  const hasChildren = childArcs.length > 0

  const toggleExpanded = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded)
    }
  }

  return (
    <li className='mb-1'>
      <button
        className={cn(
          'flex w-full items-center rounded px-2 py-1 text-left',
          hasChildren ? 'hover:bg-primary/20 cursor-pointer' : 'cursor-default'
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={toggleExpanded}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            toggleExpanded()
          }
        }}
        type='button'
      >
        {hasChildren ? (
          <span className='mr-2 font-mono text-sm'>
            {isExpanded ? '−' : '+'}
          </span>
        ) : (
          <span className='mr-2 w-4' />
        )}
        <a
          className='hover:text-primary underline'
          href={`/dashboard/campaign/${campaignSlug}/arc/${arc.slug}/`}
        >
          <span>{arc.name}</span>
        </a>
      </button>
      {/* Child arcs - rendered recursively when expanded */}
      {hasChildren && isExpanded && (
        <ul>
          {childArcs.map((childArc) => (
            <ArcItem
              key={childArc.id}
              arc={childArc}
              allArcs={allArcs}
              thingTypesData={thingTypesData}
              level={level + 1}
            />
          ))}
        </ul>
      )}
      {/* Things belonging to this arc */}
      {arc.things && arc.things.length > 0 && isExpanded && (
        <ul className='mt-1'>
          {arc.things.map((thing: TThing) => (
            <li
              key={thing.id}
              className='text-sm'
              style={{ paddingLeft: `${level * 16 + 24}px` }}
            >
              <a
                className='hover:text-primary underline'
                href={`/dashboard/campaign/${campaignSlug}/thing/${thing.slug}/`}
              >
                {thingTypesData?.find((type) => type.id === thing.typeId)
                  ?.name + ': ' || ''}
                {thing.name}
              </a>
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}
