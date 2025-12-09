import { Button } from '@components/ui/button'
import { PremiumPrompt } from '@components/ui/premium-prompt'
import { SavingSpinner } from '@components/ui/saving-spinner'
import { Tooltip, TooltipContent } from '@components/ui/tooltip'
import { UsernamePrompt } from '@components/ui/username-prompt'
import { useArcQueries } from '@hooks/useArcQueries'
import { useCampaignQueries } from '@hooks/useCampaignQueries'
import { useSubscriptionQueries } from '@hooks/useSubscriptionQueries'
import { useThingQueries } from '@hooks/useThingQueries'
import { TooltipTrigger } from '@radix-ui/react-tooltip'
import { useAppStore } from '@stores/appStore'
import { Check, X } from 'lucide-react'
import { useState } from 'react'

type TPublish = {
  published: boolean
  type: 'arc' | 'thing' | 'campaign'
  slug: string
}

export function Publish({ published, type, slug }: TPublish) {
  const { modifyArc } = useArcQueries()
  const { modifyThing } = useThingQueries()
  const { modifyCampaign } = useCampaignQueries()
  const { features } = useSubscriptionQueries()
  const { campaignSlug, user } = useAppStore()
  const [showPremiumPrompt, setShowPremiumPrompt] = useState(false)
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(false)

  const somethingPending =
    modifyArc.isPending || modifyThing.isPending || modifyCampaign.isPending

  const handlePublishToggle = async () => {
    if (!features?.hasPremium) {
      setShowPremiumPrompt(true)
      return
    }

    if (!user?.username) {
      setShowUsernamePrompt(true)
      return
    }

    if (type === 'arc') {
      await modifyArc.mutateAsync({
        updatedArc: { slug, published: !published },
      })
      return
    }

    if (type === 'thing') {
      await modifyThing.mutateAsync({
        updatedThing: { slug, published: !published },
      })
      return
    }

    if (type === 'campaign') {
      await modifyCampaign.mutateAsync({
        slug,
        published: !published,
      })
      return
    }
  }

  return (
    <>
      {showPremiumPrompt && (
        <PremiumPrompt onClose={() => setShowPremiumPrompt(false)}>
          <p>
            Publishing is a premium feature, which allows you to share public
            links to your campaign showing only exactly what you want your
            players to see.
          </p>
          <p>
            We want offer as many features as possible for free, but hosting
            public links has a cost to us, so we need to reserve this feature
            for our premium subscribers.
          </p>
          <p>
            If you&apos;d like to support the project and gain access to
            publishing and other premium features, please consider subscribing.
          </p>
        </PremiumPrompt>
      )}
      {showUsernamePrompt && (
        <UsernamePrompt
          onClose={() => setShowUsernamePrompt(false)}
          onSuccess={() => {
            setShowUsernamePrompt(false)
            // Automatically trigger publish after username is set
            handlePublishToggle()
          }}
        />
      )}
      <div>
        {published ? (
          <div className='flex items-center gap-2'>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  disabled={somethingPending}
                  variant='success'
                  onClick={handlePublishToggle}
                >
                  Published
                  {somethingPending ? (
                    <SavingSpinner />
                  ) : (
                    <Check className='h-2 w-2' />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Currently published. Click to unpublish.
              </TooltipContent>
            </Tooltip>
            <a
              href={
                type === 'campaign'
                  ? `/${user?.username || user?.name || 'user'}/campaign/${campaignSlug}/`
                  : `/${user?.username || user?.name || 'user'}/campaign/${campaignSlug}/${type}/${slug}/`
              }
              target='_blank'
              rel='noreferrer'
              className='text-accent text-sm italic hover:underline'
            >
              Open Link
            </a>
          </div>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                disabled={somethingPending}
                variant='destructive'
                onClick={handlePublishToggle}
              >
                Unpublished
                {somethingPending ? (
                  <SavingSpinner />
                ) : (
                  <X className='h-2 w-2' />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Currently unpublished. Click to publish.
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </>
  )
}
