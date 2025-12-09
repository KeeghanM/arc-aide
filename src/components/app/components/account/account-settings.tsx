import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'

import { useUserQueries } from '@hooks/useUserQueries'
import { useAppStore } from '@stores/appStore'
import { useState } from 'react'

export function AccountSettings() {
  const { user } = useAppStore()
  const { updateProfile } = useUserQueries()
  const [isEditing, setIsEditing] = useState(false)

  const [formData, setFormData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    displayUsername: user?.displayUsername || '',
  })

  const handleEdit = () => {
    setIsEditing(true)
    setFormData({
      name: user?.name || '',
      username: user?.username || '',
      displayUsername: user?.displayUsername || '',
    })
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({
      name: user?.name || '',
      username: user?.username || '',
      displayUsername: user?.displayUsername || '',
    })
  }

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({
        name: formData.name,
        username: formData.username || undefined,
        displayUsername: formData.displayUsername,
      })

      setIsEditing(false)
    } catch (error) {
      // Error is handled by the mutation hook
      console.error('Failed to update profile:', error)
    }
  }

  const isValidUsername = (username: string) => {
    if (!username) return true // Username is optional
    return /^[a-zA-Z0-9_-]{3,30}$/.test(username)
  }

  const canSave =
    formData.name.trim() &&
    isValidUsername(formData.username) &&
    (formData.name !== user?.name ||
      formData.username !== user?.username ||
      formData.displayUsername !== user?.displayUsername)

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-bold'>Profile Information</h2>
        {!isEditing && <Button onClick={handleEdit}>Edit Profile</Button>}
      </div>

      <div className='grid gap-6 md:grid-cols-2'>
        <div className='space-y-4'>
          <div>
            <Label htmlFor='username'>Username</Label>
            {isEditing ? (
              <>
                <Input
                  id='username'
                  value={formData.username}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  placeholder='your-username'
                  pattern='[a-zA-Z0-9_-]{3,30}'
                />
                <p className='text-muted-foreground mt-1 text-sm'>
                  3-30 characters. Letters, numbers, underscores, and hyphens
                  only. Used in public URLs.
                </p>
                {formData.username && (
                  <p className='mt-1 text-sm'>
                    Your content will be available at:{' '}
                    <code>/{formData.username}/campaign/...</code>
                  </p>
                )}
              </>
            ) : (
              <>
                <p className='text-lg'>{user?.username || 'Not set'}</p>
                {user?.username && (
                  <p className='text-muted-foreground text-sm'>
                    Your public URL: <code>/{user.username}/campaign/...</code>
                  </p>
                )}
              </>
            )}
          </div>

          <div>
            <Label htmlFor='displayUsername'>Display Name</Label>
            {isEditing ? (
              <>
                <Input
                  id='displayUsername'
                  value={formData.displayUsername}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      displayUsername: e.target.value,
                    }))
                  }
                  placeholder='Your display name'
                />
                <p className='text-muted-foreground mt-1 text-sm'>
                  How your name appears to others. Defaults to your username if
                  not set.
                </p>
              </>
            ) : (
              <p className='text-lg'>
                {user?.displayUsername ||
                  user?.username ||
                  user?.name ||
                  'Not set'}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor='email'>Email</Label>
            <p className='text-muted-foreground text-lg'>{user?.email}</p>
            <p className='text-muted-foreground text-sm'>
              Email cannot be changed here
            </p>
          </div>
        </div>
      </div>

      {isEditing && (
        <div className='space-y-4'>
          {updateProfile.error && (
            <div className='text-sm text-red-500'>
              {updateProfile.error instanceof Error
                ? updateProfile.error.message
                : 'An error occurred while updating your profile'}
            </div>
          )}

          <div className='flex gap-2'>
            <Button
              onClick={handleCancel}
              variant='outline'
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!canSave || updateProfile.isPending}
            >
              {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
