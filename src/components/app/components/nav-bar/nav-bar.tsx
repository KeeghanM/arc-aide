import type { TScreenWrapperProps } from '@components/app/screen-wrapper'
import ScreenWrapper from '@components/app/screen-wrapper'
import { useCampaignQueries } from '@hooks/useCampaignQueries'
import { useAppStore } from '@stores/appStore'
import { Cog } from 'lucide-react'
import SearchBar from '../search-bar/search-bar'

function Header() {
  const { campaignSlug, user } = useAppStore()
  const { useCampaignQuery } = useCampaignQueries()
  const campaignQuery = useCampaignQuery(campaignSlug ?? '')

  return (
    <header className='w-full bg-gray-800 p-4 text-white shadow'>
      <div className='container mx-auto flex max-w-screen-lg items-center'>
        {campaignSlug && campaignQuery.data && (
          <>
            <div className='flex min-w-0 items-center'>
              <h1 className='hover:text-primary max-w-[180px] truncate text-xl font-bold'>
                <a href={`/dashboard/campaign/${campaignSlug}/`}>
                  {campaignQuery.data.name}
                </a>
              </h1>
            </div>
            <div className='flex flex-1 justify-center'>
              <SearchBar />
            </div>
          </>
        )}
        <div className='ml-auto flex items-center space-x-4'>
          {user && (
            <>
              <span className='max-w-[120px] truncate text-sm'>
                Hello, {user.name}
              </span>
              <a
                href='/dashboard/account/'
                className='hover:text-primary text-sm transition-all duration-300 hover:rotate-180'
              >
                <Cog className='inline h-5 w-5' />
              </a>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default function NavBar({ user, campaignSlug }: TScreenWrapperProps) {
  return (
    <ScreenWrapper
      user={user}
      campaignSlug={campaignSlug}
    >
      <Header />
    </ScreenWrapper>
  )
}
