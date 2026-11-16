import { Select as BaseSelect } from '@base-ui/react/select'
import { RiArrowDownSLine, RiCheckLine } from '@remixicon/react'
import { useId } from 'react'
import { cn } from '../../lib/cn'

/* 表单控件：统一圆角 16、聚焦企业蓝描边 + 霓虹光，错误态玫瑰色 */
const fieldBase = 'w-full rounded-lg border border-line-strong bg-solid px-3 text-[13.5px] text-ink outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-ink-3 focus:border-volt focus:shadow-glow-volt disabled:cursor-not-allowed disabled:opacity-50'

function Field({ label, hint, error, required, children, className, aside }: {
  label?: React.ReactNode
  hint?: React.ReactNode
  error?: string
  required?: boolean
  children: React.ReactNode
  className?: string
  /** 标签行右侧，例如字数、帮助链接 */
  aside?: React.ReactNode
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {(label || aside) && (
        <div className="flex items-end justify-between gap-3">
          {label && <label className="text-[13px] font-medium text-ink">{label}{required && <span className="ml-0.5 text-rose">*</span>}</label>}
          {aside && <span className="text-[12px] text-ink-3">{aside}</span>}
        </div>
      )}
      {children}
      {error ? <p className="text-[12px] text-rose">{error}</p> : hint ? <p className="text-[12px] leading-relaxed text-ink-3">{hint}</p> : null}
    </div>
  )
}

function Input({ className, invalid, ...props }: React.ComponentProps<'input'> & { invalid?: boolean }) {
  return <input className={cn(fieldBase, 'h-9', invalid && 'border-rose', className)} {...props} />
}

function Textarea({ className, invalid, ...props }: React.ComponentProps<'textarea'> & { invalid?: boolean }) {
  return <textarea className={cn(fieldBase, 'resize-none py-3 leading-relaxed', invalid && 'border-rose', className)} {...props} />
}

type Option<V extends string> = { value: V, label: React.ReactNode, hint?: React.ReactNode, disabled?: boolean }

// 下拉选择：基于 Base UI Select
function Select<V extends string>({ value, onValueChange, options, placeholder = '请选择', className, disabled, size = 'md', 'aria-label': ariaLabel }: {
  value: V | '' | null
  onValueChange: (v: V) => void
  options: Option<V>[]
  placeholder?: string
  className?: string
  disabled?: boolean
  size?: 'sm' | 'md'
  'aria-label'?: string
}) {
  const current = options.find(o => o.value === value)
  return (
    <BaseSelect.Root value={value || null} onValueChange={v => v && onValueChange(v as V)} disabled={disabled}>
      <BaseSelect.Trigger
        aria-label={ariaLabel}
        className={cn(fieldBase, 'flex cursor-pointer items-center justify-between gap-2 text-left', size === 'sm' ? 'h-8 px-3 text-[13px]' : 'h-9', className)}
      >
        <span className={cn('truncate', !current && 'text-ink-3')}>{current?.label ?? placeholder}</span>
        <RiArrowDownSLine className="size-4 shrink-0 text-ink-3" />
      </BaseSelect.Trigger>
      <BaseSelect.Portal>
        <BaseSelect.Positioner sideOffset={6} className="z-[76]" alignItemWithTrigger={false}>
          <BaseSelect.Popup className="glass-3 max-h-[320px] min-w-[var(--anchor-width)] overflow-auto rounded-lg p-1 shadow-float outline-none transition-[opacity,transform] duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0">
            {options.map(o => (
              <BaseSelect.Item
                key={o.value}
                value={o.value}
                disabled={o.disabled}
                className="flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-1.5 text-[13px] outline-none select-none data-disabled:opacity-40 data-highlighted:bg-hover"
              >
                <BaseSelect.ItemText className="flex-1">
                  <span className="block">{o.label}</span>
                  {o.hint && <span className="block text-[11.5px] text-ink-3">{o.hint}</span>}
                </BaseSelect.ItemText>
                <BaseSelect.ItemIndicator><RiCheckLine className="size-4 text-volt-text" /></BaseSelect.ItemIndicator>
              </BaseSelect.Item>
            ))}
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  )
}

// 数字输入（带范围），执行限制、Top K 等
function NumberInput({ value, onChange, min, max, step = 1, className, suffix }: { value: number, onChange: (v: number) => void, min?: number, max?: number, step?: number, className?: string, suffix?: string }) {
  const id = useId()
  return (
    <div className={cn('relative', className)}>
      <input
        id={id}
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          const n = Number(e.target.value)
          if (!Number.isNaN(n))
            onChange(Math.min(max ?? n, Math.max(min ?? n, n)))
        }}
        className={cn(fieldBase, 'h-9 tabular-nums', suffix && 'pr-12')}
      />
      {suffix && <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-[12.5px] text-ink-3">{suffix}</span>}
    </div>
  )
}

export { Field, fieldBase, Input, NumberInput, Select, Textarea }
export type { Option }
