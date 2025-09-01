import { useAppStore } from '@components/app/stores/appStore'
import { Button } from '@components/ui/button'
import { useArcQueries } from '@hooks/useArcQueries'
import { useThingQueries } from '@hooks/useThingQueries'
import { Eye, Pencil } from 'lucide-react'
import * as React from 'react'
import ScreenWrapper, { type TScreenWrapperProps } from '../app/screen-wrapper'

/**
 * This is a mode toggle button that switches between 'edit' and 'view' modes.
 * It controls the apps global state using Zustand and persists the mode in localStorage.
 * This allows the user to toggle modes and have their preference remembered across sessions & reloads.
 */
function Switch() {
  const { mode, setMode } = useAppStore()
  const { modifyArc } = useArcQueries()
  const { modifyThing } = useThingQueries()

  React.useEffect(() => {
    const storedMode = localStorage.getItem('mode')
    if (storedMode === 'edit' || storedMode === 'view') {
      setMode(storedMode)
    }
  }, [])

  React.useEffect(() => {
    localStorage.setItem('mode', mode)
  }, [mode])

  // We disable the swap button when the app is busy saving changes to prevent mode switching during critical operations.
  // This ensures the user doesn't lose any data!
  return (
    !modifyArc.isPending &&
    !modifyThing.isPending && (
      <Button
        disabled={modifyArc.isPending || modifyThing.isPending}
        variant='secondary'
        size='icon'
        className='fixed right-4 bottom-4 z-50 rounded-full'
        onClick={() => setMode(mode === 'edit' ? 'view' : 'edit')}
      >
        {mode === 'edit' ? (
          <Pencil className='h-[1.2rem] w-[1.2rem]' />
        ) : (
          <Eye className='h-[1.2rem] w-[1.2rem]' />
        )}
        <span className='sr-only'>Toggle Mode</span>
      </Button>
    )
  )
}

export function ModeToggle({ user, campaignSlug }: TScreenWrapperProps) {
  return (
    <ScreenWrapper
      user={user}
      campaignSlug={campaignSlug}
    >
      <Switch />
    </ScreenWrapper>
  )
}
