import type { Button as BaseButtonNS } from '@base-ui/react/button'
import type { VariantProps } from 'class-variance-authority'
import { Button as BaseButton } from '@base-ui/react/button'
import { RiLoader4Line } from '@remixicon/react'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/cn'

// API 与 dify-ui Button 一致（variant / size / tone / loading），只换视觉层
const buttonVariants = cva(
  [
    'relative inline-flex cursor-pointer items-center justify-center gap-1.5 overflow-hidden whitespace-nowrap select-none',
    'transition-[background-color,box-shadow,color,border-color] duration-150 ease-out',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-volt',
    'data-disabled:cursor-not-allowed data-disabled:opacity-45',
  ],
  {
    variants: {
      variant: {
        // 主按钮：企业蓝实底，悬停加深 + 轻投影（2026-11-08 由青柠绿改为蓝色）
        primary: 'bg-volt font-semibold text-volt-ink hover:bg-volt-strong hover:shadow-glow-volt',
        secondary: 'border border-line-strong bg-solid text-ink hover:border-volt/50 hover:text-volt-text',
        ghost: 'text-ink-2 hover:bg-hover hover:text-ink',
        'ghost-accent': 'text-volt-text hover:bg-volt-soft',
        outline: 'border border-line-strong text-ink hover:border-ink-3 hover:bg-hover',
      },
      size: {
        small: 'h-7 rounded-md px-2.5 text-[12.5px] font-medium',
        medium: 'h-8 rounded-md px-3.5 text-[13px] font-medium',
        large: 'h-10 rounded-md px-5 text-[14px] font-semibold',
        icon: 'size-8 rounded-md p-0',
        'icon-small': 'size-7 rounded-md p-0',
      },
      tone: {
        default: '',
        destructive: '',
      },
    },
    compoundVariants: [
      { variant: 'primary', tone: 'destructive', class: 'bg-rose text-white hover:opacity-90 hover:bg-rose' },
      { variant: ['ghost', 'secondary'], tone: 'destructive', class: 'text-rose hover:bg-rose-soft' },
    ],
    defaultVariants: { variant: 'secondary', size: 'medium', tone: 'default' },
  },
)

type ButtonProps = Omit<BaseButtonNS.Props, 'className'> &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean
    className?: string
  }

function Button({ className, variant, size, tone, loading, disabled, type = 'button', children, ...props }: ButtonProps) {
  return (
    <BaseButton
      type={type}
      className={cn(buttonVariants({ variant, size, tone }), className)}
      disabled={disabled || loading}
      focusableWhenDisabled={loading}
      {...props}
    >
      {loading && <RiLoader4Line className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />}
      {children}
    </BaseButton>
  )
}

export { Button, buttonVariants }
export type { ButtonProps }
