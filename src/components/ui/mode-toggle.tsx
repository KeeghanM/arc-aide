import { useAppStore } from '@components/app/stores/appStore'
import { Button } from '@components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu'
import { Eye, Pencil } from 'lucide-react'
import * as React from 'react'

/**
 * This is a mode toggle button that switches between 'edit' and 'view' modes.
 * It controls the apps global state using Zustand and persists the mode in localStorage.
 * This allows the user to toggle modes and have their preference remembered across sessions & reloads.
 */
export function ModeToggle() {
  const { mode, setMode } = useAppStore()

  React.useEffect(() => {
    const storedMode = localStorage.getItem('mode')
    if (storedMode === 'edit' || storedMode === 'view') {
      setMode(storedMode)
    }
  }, [])

  React.useEffect(() => {
    localStorage.setItem('mode', mode)
  }, [mode])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          size='icon'
          className='fixed right-4 bottom-4 z-50 rounded-full'
        >
          {mode === 'edit' ? (
            <Pencil className='h-[1.2rem] w-[1.2rem]' />
          ) : (
            <Eye className='h-[1.2rem] w-[1.2rem]' />
          )}
          <span className='sr-only'>Toggle Mode</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={() => setMode('edit')}>
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setMode('view')}>
          View
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
