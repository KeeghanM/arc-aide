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
import { useAssetQueries } from '@hooks/useAssetQueries'
import { useSubscriptionQueries } from '@hooks/useSubscriptionQueries'
import { UploadCloudIcon } from 'lucide-react'
import { useState } from 'react'

type TImageUploaderProps = {
  onUploadSuccess: (asset: { label: string; url: string }) => void
  altText: string | undefined
}

/**
 * This component handles the uploading of Assets
 * It's only available to Premium Members, although Free members can always use external URLs
 */
export default function ImageUploader({
  onUploadSuccess,
  altText,
}: TImageUploaderProps) {
  const [open, setOpen] = useState(false)
  const [label, setLabel] = useState(altText ?? '')
  const [file, setFile] = useState<File | null>(null)

  const { features } = useSubscriptionQueries()
  const { uploadAsset } = useAssetQueries()

  const handleUpload = async () => {
    if (!file || !label) return

    uploadAsset.mutate(
      {
        label,
        file,
      },
      {
        onSuccess: (assetUrl) =>
          onUploadSuccess({
            label,
            url: assetUrl,
          }),
      }
    )
  }

  if (!features.hasPremium) return null

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
        <Button
          className='m-0 rounded-full p-0'
          variant='default'
        >
          Upload
          <UploadCloudIcon className='h-4 w-4' />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Image</DialogTitle>
        </DialogHeader>

        <Input
          placeholder='Descriptive Label'
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <Input
          type='file'
          accept='image/*'
          onChange={(e) => {
            const files = e.currentTarget.files
            if (files) setFile(files[0])
          }}
        />
        {uploadAsset.error && (
          <div className='mt-2 text-sm text-red-500'>
            {uploadAsset.error.message}
          </div>
        )}
        <DialogFooter>
          <Button
            variant='default'
            disabled={uploadAsset.isPending || !file}
            onClick={handleUpload}
          >
            {uploadAsset.isPending ? 'Uploading...' : 'Upload'}
          </Button>
          <DialogClose asChild>
            <Button variant='outline'>Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
