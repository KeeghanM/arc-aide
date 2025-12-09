import { Button } from '@components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'

import { useUserQueries } from '@hooks/useUserQueries'
import { useState } from 'react'

type TUsernamePromptProps = {
  onClose: () => void
  onSuccess: () => void
}

export function UsernamePrompt({ onClose, onSuccess }: TUsernamePromptProps) {
  const [username, setUsername] = useState('')
  const [displayUsername, setDisplayUsername] = useState('')
  const { setupUsername } = useUserQueries()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await setupUsername.mutateAsync({
        username,
        displayUsername: displayUsername || username,
      })

      onSuccess()
    } catch (error) {
      // Error is handled by the mutation hook
      console.error('Failed to set username:', error)
    }
  }

  const isValidUsername = (username: string) => {
    return /^[a-zA-Z0-9_-]{3,30}$/.test(username)
  }

  return (
    <Dialog
      open={true}
      onOpenChange={onClose}
    >
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Choose Your Username</DialogTitle>
          <DialogDescription>
            To publish content, you need to set a username. This will be used in
            your public URLs and cannot be changed easily later.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className='space-y-4'
        >
          <div>
            <Label htmlFor='username'>Username</Label>
            <Input
              id='username'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder='your-username'
              required
              pattern='[a-zA-Z0-9_-]{3,30}'
              title='Username must be 3-30 characters and contain only letters, numbers, underscores, and hyphens'
            />
            <p className='text-muted-foreground mt-1 text-sm'>
              3-30 characters. Letters, numbers, underscores, and hyphens only.
            </p>
            {username && (
              <p className='mt-1 text-sm'>
                Your content will be available at:{' '}
                <code>/{username}/campaign/...</code>
              </p>
            )}
          </div>

          <div>
            <Label htmlFor='displayUsername'>Display Name (Optional)</Label>
            <Input
              id='displayUsername'
              value={displayUsername}
              onChange={(e) => setDisplayUsername(e.target.value)}
              placeholder='Your Display Name'
            />
            <p className='text-muted-foreground mt-1 text-sm'>
              How your name appears to others. Defaults to your username if not
              set.
            </p>
          </div>

          {setupUsername.error && (
            <div className='text-sm text-red-500'>
              {setupUsername.error instanceof Error
                ? setupUsername.error.message
                : 'An error occurred while setting up your username'}
            </div>
          )}

          <div className='flex justify-end gap-2'>
            <Button
              type='button'
              variant='outline'
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={!isValidUsername(username) || setupUsername.isPending}
            >
              {setupUsername.isPending ? 'Setting Username...' : 'Set Username'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
