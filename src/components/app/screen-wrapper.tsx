import { useAppStore } from '@stores/appStore'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'

const queryClient = new QueryClient()

type TUser = {
  name: string
}

export type TScreenWrapperProps = {
  user: TUser
  children?: React.ReactNode
  campaignSlug: string | undefined
}

export default function ScreenWrapper({
  user,
  children,
  campaignSlug,
}: TScreenWrapperProps) {
  const { setUser, setCampaignSlug } = useAppStore()

  useEffect(() => {
    setUser(user)
  }, [user, setUser])

  useEffect(() => {
    if (campaignSlug) {
      setCampaignSlug(campaignSlug)
    }
  }, [setCampaignSlug, campaignSlug])

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
