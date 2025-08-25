import TimeAgo from '@components/ui/time-ago'
import type { TArc } from '@hooks/useArcQueries'

export default function Arc({ arc }: { arc: TArc }) {
  return (
    <div className='bg-background relative cursor-pointer rounded border p-4 shadow transition hover:shadow-lg'>
      <h2 className='mb-2 text-xl font-bold'>{arc.name}</h2>
      <p className='text-gray-600'>
        Last edited <TimeAgo datetime={arc.updatedAt} />
      </p>
      <a
        href={`arc/${arc.slug}/`}
        className='absolute inset-0'
      >
        <span className='sr-only'>View Arc</span>
      </a>
    </div>
  )
}
