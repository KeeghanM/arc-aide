import { useState } from 'react'
import { Button } from './button'
import { Dialog, DialogContent, DialogTrigger } from './dialog'

export function PremiumPrompt({
  children,
  onClose,
  trigger,
}: {
  children?: React.ReactNode
  onClose?: () => void
  trigger?: React.ReactNode
}) {
  const [open, setOpen] = useState(trigger === undefined)

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val)
        if (!val && onClose) {
          onClose()
        }
      }}
    >
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <div className='flex flex-col gap-4'>
          <h2 className='text-xl font-bold'>Premium Feature</h2>
          {children}
          <Button>
            <a href='/dashboard/account/'>Upgrade to Premium</a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
