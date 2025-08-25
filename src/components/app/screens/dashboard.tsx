import type { TCampaign } from '@hooks/useCampaignQueries'
import CampaignList from '../components/campaign/campaign-list/campaign-list'
import CreateCampaign from '../components/campaign/create-campaign/create-campaign'
import ScreenWrapper, { type TScreenWrapperProps } from '../screen-wrapper'

type TDashboardProps = {
  initialCampaigns: TCampaign[]
}

function Dashboard({ initialCampaigns }: TDashboardProps) {
  return (
    <div className='h-full w-full space-y-6 p-4 md:p-6 lg:p-12'>
      <h1 className='text-primary text-4xl font-bold md:text-5xl'>
        Your Campaigns
      </h1>
      <CampaignList initialCampaigns={initialCampaigns} />
      <CreateCampaign />
    </div>
  )
}

export default function DashboardScreen({
  initialCampaigns,
  user,
}: TDashboardProps & TScreenWrapperProps) {
  return (
    <ScreenWrapper
      user={user}
      campaignSlug={undefined}
    >
      <Dashboard initialCampaigns={initialCampaigns} />
    </ScreenWrapper>
  )
}
