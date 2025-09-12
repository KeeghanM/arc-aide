import ScreenWrapper, {
  type TScreenWrapperProps,
} from '@components/app/screen-wrapper'
import { useArcQueries } from '@hooks/useArcQueries'
import { useThingQueries } from '@hooks/useThingQueries'
import { useThingTypeQueries } from '@hooks/useThingTypeQueries'
import { useAppStore } from '@stores/appStore'
import ArcItem from './arc-item'
import CreateArc from '../arc/create-arc/create-arc'
import CreateThing from '../thing/create-thing/create-thing'

type TSideBarProps = {}

/**
 * This sidebar acts as the main navigation for the app.
 * All campaign elements are accessible from here. Arcs, Things, etc.
 *
 * They show as a navigation tree, with nested arcs indented under parents.
 * Things show under arcs they belong to. Which means they can appear multiple times.
 *
 * Things then also have their own section, where they're grouped by type.
 */
function SideBar() {
  const { campaignSlug } = useAppStore()
  const { arcsQuery } = useArcQueries()
  const { useThingsQuery } = useThingQueries()
  const { thingTypesQuery } = useThingTypeQueries()
  const thingsQuery = useThingsQuery({
    fetchAll: true,
  })

  return (
    <aside className='border-border sticky top-0 h-screen max-h-screen w-64 overflow-y-auto border-r p-4 shadow'>
      {arcsQuery.isLoading ||
      thingsQuery.isLoading ||
      thingTypesQuery.isLoading ? (
        <p>Loading...</p>
      ) : arcsQuery.error || thingsQuery.error || thingTypesQuery.error ? (
        <p>Error loading data</p>
      ) : (
        <div>
          <h2 className='text-primary mb-4 flex items-center justify-between text-lg font-bold'>
            Arcs
            <CreateArc />
          </h2>
          <ul>
            {arcsQuery.data?.map((arc) =>
              arc.parentArcId ? null : (
                <ArcItem
                  key={arc.id}
                  arc={arc}
                  allArcs={arcsQuery.data || []}
                />
              )
            )}
          </ul>

          <h2 className='text-primary mt-8 mb-4 flex items-center justify-between text-lg font-bold'>
            Things
            <CreateThing />
          </h2>

          {thingTypesQuery.data?.map((type) => {
            const thingsOfType = thingsQuery.data?.filter(
              (thing) => thing.typeId === type.id
            )
            return (
              <div
                key={type.id}
                className='mb-4'
              >
                <h3 className='text-md mb-2 font-semibold'>{type.name}</h3>
                {thingsOfType && thingsOfType.length > 0 ? (
                  <ul>
                    {thingsOfType.map((thing) => (
                      <li
                        key={thing.id}
                        className='pl-2 text-sm'
                      >
                        <a
                          className='hover:text-primary underline'
                          href={`/dashboard/campaign/${campaignSlug}/thing/${thing.slug}/`}
                        >
                          {thing.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className='text-sm italic'>No things of this type.</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </aside>
  )
}

export default function SideBarWrapper({
  user,
  campaignSlug,
}: TSideBarProps & TScreenWrapperProps) {
  return (
    <ScreenWrapper
      user={user}
      campaignSlug={campaignSlug}
    >
      <SideBar />
    </ScreenWrapper>
  )
}
