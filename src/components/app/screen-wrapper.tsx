import { useAppStore } from '@stores/appStore'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { User } from 'better-auth'
import { useEffect } from 'react'

const queryClient = new QueryClient()

type TUser = User & {
  username?: string
  displayUsername?: string
}

export type TScreenWrapperProps = {
  user: TUser
  children?: React.ReactNode
  campaignSlug: string | undefined
}

export function ScreenWrapper({
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
