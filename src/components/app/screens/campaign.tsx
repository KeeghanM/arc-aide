import { type TArc, useArcQueries } from '@hooks/useArcQueries'
import { type TThing, useThingQueries } from '@hooks/useThingQueries'
import { ArcItem } from '../components/arc/arc-item'
import { CreateArc } from '../components/arc/create-arc/create-arc'
import { CampaignSettings } from '../components/campaign/campaign-settings/campaign-settings'
import { Publish } from '../components/publish/publish'
import { CreateThing } from '../components/thing/create-thing/create-thing'
import { Thing } from '../components/thing/thing'
import { useCampaignQueries } from '../hooks/useCampaignQueries'
import { ScreenWrapper, type TScreenWrapperProps } from '../screen-wrapper'

type TCampaignProps = {
  initialArcs: TArc[]
  latestThings: TThing[]
  published: boolean
  campaignSlug: string
}

/**
 * Campaign Dashboard Component
 *
 * Main dashboard view for a D&D campaign showing:
 * - Top-level arcs (nested arcs are hidden to reduce clutter)
 * - Recent things (limited to 5 for performance)
 * - Creation buttons for quick content addition
 *
 * Uses initial data from SSR as fallback while React Query loads fresh data.
 */
function Campaign({
  initialArcs,
  latestThings,
  published,
  campaignSlug,
}: TCampaignProps) {
  const { arcsQuery } = useArcQueries()
  const { useThingsQuery } = useThingQueries()
  const { useCampaignQuery } = useCampaignQueries()
  const campaignQuery = useCampaignQuery(campaignSlug)

  const thingsQuery = useThingsQuery({
    count: 20,
  })

  return (
    <>
      <div className='bg-primary/10 mb-2 flex items-center gap-8 rounded p-2'>
        <CampaignSettings />
        <a
          href='/dashboard/'
          className='text-red-500 hover:underline'
        >
          Exit to Dashboard
        </a>
        <div className='flex items-center gap-2'>
          <Publish
            published={campaignQuery.data?.published ?? published}
            type='campaign'
            slug={campaignSlug}
          />
        </div>
      </div>
      {/* --- Arcs Section --- */}
      <h2 className='mb-4 flex items-center gap-4 text-2xl font-semibold'>
        Arcs <CreateArc />
      </h2>
      <div className='border-border bg-primary/5 grid gap-4 rounded-lg border p-4 md:grid-cols-2 lg:grid-cols-3'>
        {/* 
          Use SSR data as fallback while React Query loads.
          Filter to show only top-level arcs to avoid nested complexity.
        */}
        {(arcsQuery.isPending || arcsQuery.data === undefined
          ? initialArcs
          : arcsQuery.data
        )
          .filter((a) => !a.parentArcId)
          .map((a) => (
            <ArcItem
              arc={a}
              key={a.id}
            />
          ))}
      </div>

      {/* --- Things Section --- */}
      <h2 className='mt-8 mb-4 text-2xl font-semibold'>
        Latest Things <CreateThing />
      </h2>
      <div className='border-border bg-primary/5 grid gap-4 rounded-lg border p-4 md:grid-cols-2 lg:grid-cols-3'>
        {/* Limit to 5 most recent things for dashboard performance */}
        {(thingsQuery.isPending || thingsQuery.data === undefined
          ? latestThings
          : thingsQuery.data
        )
          .slice(0, 5)
          .map((thing) => (
            <Thing
              key={thing.id}
              thing={thing}
            />
          ))}
      </div>
    </>
  )
}

export function CampaignScreen({
  published,
  campaignSlug,
  initialArcs,
  latestThings,
  user,
}: TCampaignProps & TScreenWrapperProps) {
  return (
    <ScreenWrapper
      user={user}
      campaignSlug={campaignSlug}
    >
      <Campaign {...{ initialArcs, latestThings, campaignSlug, published }} />
    </ScreenWrapper>
  )
}
