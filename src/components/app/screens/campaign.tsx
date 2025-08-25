import { useArcQueries, type TArc } from '@hooks/useArcQueries'
import { useThingQueries, type TThing } from '@hooks/useThingQueries'
import Arc from '../components/arc/arc'
import CreateArc from '../components/arc/create-arc/create-arc'
import CreateThing from '../components/thing/create-thing/create-thing'
import Thing from '../components/thing/thing'
import ScreenWrapper, { type TScreenWrapperProps } from '../screen-wrapper'

type TCampaignProps = {
  initialArcs: TArc[]
  latestThings: TThing[]
}

function Campaign({ initialArcs, latestThings }: TCampaignProps) {
  const { arcsQuery } = useArcQueries()
  const { useThingsQuery } = useThingQueries()

  const thingsQuery = useThingsQuery(20)

  return (
    <div>
      <h2 className='mb-4 flex items-center gap-4 text-2xl font-semibold'>
        Arcs <CreateArc />
      </h2>
      <div className='border-border bg-primary/5 grid gap-4 rounded-lg border p-4 md:grid-cols-2 lg:grid-cols-3'>
        {(arcsQuery.isPending || arcsQuery.data === undefined
          ? initialArcs
          : arcsQuery.data
        )
          .filter((a) => !a.parentArcId) // Only show top level arcs
          .map((a) => (
            <Arc
              arc={a}
              key={a.id}
            />
          ))}
      </div>
      <h2 className='mt-8 mb-4 text-2xl font-semibold'>
        Latest Things <CreateThing />
      </h2>
      <div className='border-border bg-primary/5 grid gap-4 rounded-lg border p-4 md:grid-cols-2 lg:grid-cols-3'>
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
    </div>
  )
}

export default function CampaignScreen({
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
      <Campaign {...{ initialArcs, latestThings }} />
    </ScreenWrapper>
  )
}
