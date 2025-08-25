import TimeAgo from '@components/ui/time-ago'
import type { TArc } from '@hooks/useArcQueries'

/**
 * Arc Card Component
 *
 * Displays a clickable card for an individual arc with its name and last update time.
 * Uses absolute positioning overlay pattern for full-card clickability while maintaining accessibility.
 */
export default function Arc({ arc }: { arc: TArc }) {
  return (
    <div className='bg-background relative cursor-pointer rounded border p-4 shadow transition hover:shadow-lg'>
      <h2 className='mb-2 text-xl font-bold'>{arc.name}</h2>
      <p className='text-gray-600'>
        Last edited <TimeAgo datetime={arc.updatedAt} />
      </p>
      {/* 
        Absolute positioned link covers entire card for accessibility
        while allowing normal text selection and screen reader support
      */}
      <a
        href={`arc/${arc.slug}/`}
        className='absolute inset-0'
      >
        <span className='sr-only'>View Arc</span>
      </a>
    </div>
  )
}
