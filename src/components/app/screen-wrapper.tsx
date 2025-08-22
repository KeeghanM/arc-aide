import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useAppStore } from './stores/appStore'

const queryClient = new QueryClient()

export interface User {
  name: string
}

export interface ScreenWrapperProps {
  user: User
  children: React.ReactNode
}

export default function ScreenWrapper({ user, children }: ScreenWrapperProps) {
  const { setUser } = useAppStore()

  useEffect(() => {
    setUser(user)
  }, [user, setUser])

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
