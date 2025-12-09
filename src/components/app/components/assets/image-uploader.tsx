import { Button } from '@components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@components/ui/dialog'
import { Input } from '@components/ui/input'
import { PremiumPrompt } from '@components/ui/premium-prompt'
import { useAssetQueries } from '@hooks/useAssetQueries'
import { useSubscriptionQueries } from '@hooks/useSubscriptionQueries'
import { LinkIcon, UploadCloudIcon } from 'lucide-react'
import { useState } from 'react'

type TImageUploaderProps = {
  onUploadSuccess: (asset: { label: string; url: string }) => void
  altText: string | undefined
}

/**
 * This component handles the insertion of images into the editor.
 * Users can either upload an image file (premium feature) or provide an image URL.
 */
export function ImageUploader({
  onUploadSuccess,
  altText,
}: TImageUploaderProps) {
  const [open, setOpen] = useState(true)
  const [label, setLabel] = useState(altText ?? '')
  const [file, setFile] = useState<File | null>(null)
  const [url, setUrl] = useState('')
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('url')
  const [showPremiumPrompt, setShowPremiumPrompt] = useState(false)

  const { features } = useSubscriptionQueries()
  const { uploadAsset } = useAssetQueries()

  const resetForm = () => {
    setFile(null)
    setUrl('')
  }

  const handleModeChange = (mode: 'file' | 'url') => {
    if (mode === uploadMode) return
    if (mode === 'file' && !features?.hasPremium) {
      setShowPremiumPrompt(true)
      return
    }

    setUploadMode(mode)
    resetForm()
  }

  const handleUpload = async () => {
    if (!label) return

    if (uploadMode === 'url' && url.trim() !== '') {
      onUploadSuccess({
        label,
        url,
      })
      setOpen(false)
      return
    }

    if (uploadMode === 'file' && file) {
      uploadAsset.mutate(
        {
          label,
          file,
        },
        {
          onSuccess: (assetUrl) => {
            onUploadSuccess({
              label,
              url: assetUrl,
            })
            setOpen(false)
          },
        }
      )
      return
    }
  }

  return (
    <>
      {showPremiumPrompt && (
        <PremiumPrompt onClose={() => setShowPremiumPrompt(false)}>
          <p>
            Uploading custom image files is a premium feature, but you can still
            use image URLs for free.
          </p>
          <p>
            We want to offer as many features as we can for free, and one of the
            most expensive parts of running the site is storage space.
          </p>
          <p>
            If you&apos;d like to support the project and gain access to
            multiple campaigns, please consider upgrading to a premium account.
          </p>
        </PremiumPrompt>
      )}

      <Dialog
        open={open}
        onOpenChange={(newOpen) => {
          setOpen(newOpen)
          if (!newOpen) {
            resetForm()
          }
        }}
      >
        <DialogTrigger asChild>
          <Button
            className='rounded-full'
            variant='default'
          >
            Add Image
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {uploadMode === 'file' ? 'Upload Image' : 'Add Image URL'}
            </DialogTitle>
          </DialogHeader>

          <Input
            placeholder='Descriptive Label'
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />

          {uploadMode === 'file' ? (
            <Input
              type='file'
              accept='image/*'
              onChange={(e) => {
                const files = e.currentTarget.files
                if (files) setFile(files[0])
              }}
            />
          ) : (
            <Input
              placeholder='Image URL (e.g., https://example.com/image.jpg)'
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              type='url'
            />
          )}
          {/* Toggle between upload modes */}
          <div className='flex gap-2'>
            <Button
              variant={uploadMode === 'url' ? 'default' : 'outline'}
              size='sm'
              onClick={() => handleModeChange('url')}
            >
              <LinkIcon className='h-4 w-4' />
              Use URL
            </Button>
            <Button
              variant={uploadMode === 'file' ? 'default' : 'outline'}
              size='sm'
              onClick={() => handleModeChange('file')}
            >
              <UploadCloudIcon className='h-4 w-4' />
              Upload File
            </Button>
          </div>

          {uploadAsset.error && uploadMode === 'file' && (
            <div className='mt-2 text-sm text-red-500'>
              {uploadAsset.error.message}
            </div>
          )}

          <DialogFooter>
            <Button
              variant='default'
              disabled={
                (uploadMode === 'file' && (uploadAsset.isPending || !file)) ||
                (uploadMode === 'url' && !url) ||
                !label
              }
              onClick={handleUpload}
            >
              {uploadMode === 'file' && uploadAsset.isPending
                ? 'Uploading...'
                : uploadMode === 'file'
                  ? 'Upload'
                  : 'Add Image'}
            </Button>
            <DialogClose asChild>
              <Button variant='outline'>Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
