import { useThingQueries } from '@components/app/hooks/useThingQueries'
import {
  ScreenWrapper,
  type TScreenWrapperProps,
} from '@components/app/screen-wrapper'
import { AddThingToArc } from '../add-thing-to-arc/add-thing-to-arc'

type TArcListProps = {
  initialArcs: { id: number; name: string; slug: string }[]
  campaignSlug: string
  thingSlug: string
}

function ArcList({ initialArcs, campaignSlug, thingSlug }: TArcListProps) {
  const { useArcsWithThingQuery } = useThingQueries()
  const arcsWithThingQuery = useArcsWithThingQuery(thingSlug)

  return (
    <div>
      <AddThingToArc thingSlug={thingSlug} />
      {(arcsWithThingQuery.isPending || arcsWithThingQuery.data === undefined
        ? initialArcs
        : arcsWithThingQuery.data
      ).map((arc) => (
        <a
          key={arc.id}
          href={`/dashboard/campaign/${campaignSlug}/arc/${arc.slug}/`}
          className='border-border bg-primary/5 flex rounded-lg border p-4 text-lg font-semibold'
        >
          {arc.name}
        </a>
      ))}
    </div>
  )
}

export function ArcListWrapper({
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
