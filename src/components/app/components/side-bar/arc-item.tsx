import type { TArc } from '@hooks/useArcQueries'
import { cn } from '@lib/utils/cn'
import { useAppStore } from '@stores/appStore'
import { useState } from 'react'

type TArcItemProps = {
  arc: TArc
  allArcs: TArc[]
  level?: number
}

export default function ArcItem({ arc, allArcs, level = 0 }: TArcItemProps) {
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
        {isExpanded || !hasChildren ? (
          <a
            className='hover:text-primary underline'
            href={`/dashboard/campaign/${campaignSlug}/arc/${arc.slug}/`}
          >
            <span>{arc.name}</span>
          </a>
        ) : (
          <p>
            <span>{arc.name}</span>
          </p>
        )}
      </button>
      {/* Child arcs - rendered recursively when expanded */}
      {hasChildren && isExpanded && (
        <ul>
          {childArcs.map((childArc) => (
            <ArcItem
              key={childArc.id}
              arc={childArc}
              allArcs={allArcs}
              level={level + 1}
            />
          ))}
        </ul>
      )}
    </li>
  )
}
