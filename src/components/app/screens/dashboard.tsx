import type { TCampaign } from '@hooks/useCampaignQueries'
import CampaignList from '../components/campaign-list/campaign-list'
import CreateCampaign from '../components/create-campaign/create-campaign'
import ScreenWrapper, { type User } from '../screen-wrapper'

interface DashboardProps {
  initialCampaigns: TCampaign[]
  user: User
}

function Dashboard({ initialCampaigns }: { initialCampaigns: TCampaign[] }) {
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
}: DashboardProps) {
  return (
    <ScreenWrapper user={user}>
      <Dashboard initialCampaigns={initialCampaigns} />
    </ScreenWrapper>
  )
}
