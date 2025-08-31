import { useSyncMutation } from '@hooks/useSyncMutation'
import { useAppStore } from '@stores/appStore'
import { usePostHog } from 'posthog-js/react'

export function useAssetQueries() {
  const posthog = usePostHog()
  const { campaignSlug } = useAppStore()

  // TODO: We will eventually build an asset manager and search functionality. For now, we just need the upload hook

  const uploadAsset = useSyncMutation({
    mutationFn: async ({
      label,
      file,
    }: {
      label: string
      file: File
    }): Promise<string> => {
      // Step 1: Request one-time upload URL from our backend
      const uploadUrlResponse = await fetch(
        `/api/campaigns/${campaignSlug}/assets/upload-url`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ label }),
        }
      )

      if (!uploadUrlResponse.ok) {
        throw new Error('Failed to get upload URL')
      }

      const { uploadUrl, imageId } = await uploadUrlResponse.json()

      // Step 2: Upload file directly to Cloudflare
      const formData = new FormData()
      formData.append('file', file)

      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image')
      }

      // Step 3: Confirm upload and get the final URL
      const confirmResponse = await fetch(
        `/api/campaigns/${campaignSlug}/assets/confirm-upload`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageId, label }),
        }
      )

      if (!confirmResponse.ok) {
        throw new Error('Failed to confirm upload')
      }

      const { url } = await confirmResponse.json()

      posthog?.capture('asset_uploaded', {
        name: label,
        campaignSlug,
      })

      return url
    },
  })

  return {
    uploadAsset,
  }
}
