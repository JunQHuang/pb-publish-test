import { Dialog as BaseDialog } from '@base-ui/react/dialog'
import { RiCloseLine } from '@remixicon/react'
import { cn } from '../../lib/cn'
import { Button } from './button'

type DialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: React.ReactNode
  description?: React.ReactNode
  children?: React.ReactNode
  footer?: React.ReactNode
  /** sm 420 / md 560 / lg 720 / xl 920 */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'wide' | 'screen'
}

const widths = { sm: 'w-[420px]', md: 'w-[560px]', lg: 'w-[720px]', xl: 'w-[920px]', wide: 'w-[1320px]', screen: 'w-[calc(100vw-24px)] h-[calc(100dvh-24px)] !max-h-[calc(100dvh-24px)] !max-w-none' }

// 居中对话框：用于创建、编辑信息、表单类操作
function Dialog({ open, onOpenChange, title, description, children, footer, size = 'md' }: DialogProps) {
  return (
    <BaseDialog.Root open={open} onOpenChange={o => onOpenChange(o)}>
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="fixed inset-0 z-[70] bg-black/35 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <BaseDialog.Popup
          className={cn(
            'glass-3 fixed top-1/2 left-1/2 z-[71] flex max-h-[86vh] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-xl shadow-float outline-none',
            'transition-[opacity,transform] duration-200 ease-out data-ending-style:scale-[0.97] data-ending-style:opacity-0 data-starting-style:scale-[0.97] data-starting-style:opacity-0',
            widths[size],
          )}
        >
          <div className="flex items-start gap-3 px-6 pt-5 pb-3">
            <div className="min-w-0 flex-1">
              <BaseDialog.Title className="text-[17px] font-semibold tracking-[-0.01em]">{title}</BaseDialog.Title>
              {description && <BaseDialog.Description className="mt-1 text-[13px] text-ink-3">{description}</BaseDialog.Description>}
            </div>
            <BaseDialog.Close render={<Button variant="ghost" size="icon-small" aria-label="关闭" />}>
              <RiCloseLine className="size-4" />
            </BaseDialog.Close>
          </div>
          {children && <div className="min-h-0 flex-1 overflow-auto px-6 pb-4">{children}</div>}
          {footer && <div className="flex justify-end gap-2 border-t border-line px-6 py-4">{footer}</div>}
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  )
}

// 二次确认：删除、撤销、覆盖等不可逆操作
function ConfirmDialog({ open, onOpenChange, title, description, confirmText = '确认', danger, loading, onConfirm }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: React.ReactNode
  description?: React.ReactNode
  confirmText?: string
  danger?: boolean
  loading?: boolean
  onConfirm: () => void
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      size="sm"
      footer={(
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>取消</Button>
          <Button variant="primary" tone={danger ? 'destructive' : 'default'} loading={loading} onClick={onConfirm}>{confirmText}</Button>
        </>
      )}
    />
  )
}

export { ConfirmDialog, Dialog }
