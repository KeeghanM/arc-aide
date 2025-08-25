import type { TArc } from '@components/app/hooks/useArcQueries'
import ScreenWrapper, {
  type TScreenWrapperProps,
} from '@components/app/screen-wrapper'
import { useEffect } from 'react'
import AddThingToArc from '../add-thing-to-arc/add-thing-to-arc'
import { useThingQueries } from '@/components/app/hooks/useThingQueries'

type TArcListProps = {
  initialArcs: TArc[]
  campaignSlug: string
  thingSlug: string
}

function ArcList({ initialArcs, campaignSlug, thingSlug }: TArcListProps) {
  const { useArcsWithThingQuery } = useThingQueries()
  const arcsWithThingQuery = useArcsWithThingQuery(thingSlug)

  useEffect(() => {
    console.log('Data', {
      initialArcs,
      arcsWithThingData: arcsWithThingQuery.data,
    })
  }, [arcsWithThingQuery.data])

  return (
    <div>
      <AddThingToArc thingSlug={thingSlug} />
      {(arcsWithThingQuery.isPending || arcsWithThingQuery.data === undefined
        ? initialArcs
        : arcsWithThingQuery.data
      ).map((arc) => (
        <a
          href={`/dashboard/campaign/${campaignSlug}/arc/${arc.slug}/`}
          className='border-border bg-primary/5 flex rounded-lg border p-4 text-lg font-semibold'
        >
          {arc.name}
        </a>
      ))}
    </div>
  )
}

export default function ArcListWrapper({
  initialArcs,
  campaignSlug,
  user,
  thingSlug,
}: TArcListProps & TScreenWrapperProps) {
  return (
    <ScreenWrapper
      user={user}
      campaignSlug={campaignSlug}
    >
      <ArcList
        thingSlug={thingSlug}
        campaignSlug={campaignSlug}
        initialArcs={initialArcs}
      />
    </ScreenWrapper>
  )
}
