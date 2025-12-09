import TimeAgo from '@components/ui/time-ago'
import type { TThing } from '@hooks/useThingQueries'
import { useAppStore } from '@stores/appStore'

/**
 * Thing Card Component
 *
 * Displays a clickable card for a campaign "Thing" (character, location, item, etc.).
 * In D&D terms, a "Thing" represents any trackable entity in the campaign world.
 * Uses the same card pattern as Arc component for consistency.
 */
export function Thing({ thing }: { thing: TThing }) {
  const { campaignSlug } = useAppStore()
  return (
    <div className='bg-background relative cursor-pointer rounded border p-4 shadow transition hover:shadow-lg'>
      <h2 className='mb-2 text-xl font-bold'>{thing.name}</h2>
      <p className='text-gray-600'>
        Last edited <TimeAgo datetime={thing.updatedAt} />
      </p>
      {/* Full-card navigation link */}
      <a
        href={`/dashboard/campaign/${campaignSlug}/thing/${thing.slug}/`}
        className='absolute inset-0'
      >
        <span className='sr-only'>View Thing</span>
      </a>
    </div>
  )
}
