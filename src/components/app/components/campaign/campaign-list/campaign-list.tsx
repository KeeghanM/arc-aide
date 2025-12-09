import { type TCampaign, useCampaignQueries } from '@hooks/useCampaignQueries'
import { slugify } from '@utils/string'

type TCampaignList = {
  initialCampaigns: TCampaign[]
}

export function CampaignList({ initialCampaigns }: TCampaignList) {
  const { campaignsQuery } = useCampaignQueries()
  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
      {/* 
            We use the campaigns passed as props as a fallback to avoid layout shifts
            while the query is loading. Once we have data from the query, we use that instead.
        */}
      {(campaignsQuery.isPending || campaignsQuery.data === undefined
        ? initialCampaigns
        : campaignsQuery.data
      ).map((campaign) => (
        <a
          href={`/dashboard/campaign/${slugify(campaign.name)}/`}
          key={campaign.id}
          className='cursor-pointer rounded-lg border p-4 shadow transition-shadow hover:shadow-lg'
          type='button'
        >
          <h2 className='mb-2 text-xl font-semibold'>{campaign.name}</h2>
          <p className='text-sm text-gray-500'>
            Last updated: {new Date(campaign.updatedAt).toLocaleDateString()}
          </p>
        </a>
      ))}
    </div>
  )
}
