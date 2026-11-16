import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'
import { motion } from 'motion/react'
import { cn } from '../../lib/cn'
import { ease } from '../../lib/motion'

/* ---------- Panel：三级毛玻璃，层级越高越实 ---------- */
const panelVariants = cva('glass-edge', {
  variants: {
    level: { 1: 'glass-1', 2: 'glass-2', 3: 'glass-3 shadow-float' },
    radius: { md: 'rounded-lg', lg: 'rounded-xl', xl: 'rounded-xl' },
    glow: { none: '', volt: 'neon-ring' },
  },
  defaultVariants: { level: 1, radius: 'lg', glow: 'none' },
})

function Panel({ className, level, radius, glow, ...props }: React.ComponentProps<'div'> & VariantProps<typeof panelVariants>) {
  return <div className={cn(panelVariants({ level, radius, glow }), className)} {...props} />
}

/* ---------- Badge ---------- */
const badgeVariants = cva('inline-flex h-[22px] items-center gap-1.5 rounded-md px-2 text-[12px] font-medium whitespace-nowrap', {
  variants: {
    tone: {
      neutral: 'bg-hover text-ink-2',
      volt: 'bg-volt-soft text-volt-text',
      cyan: 'bg-cyan-soft text-cyan',
      mint: 'bg-mint-soft text-mint',
      amber: 'bg-amber-soft text-amber',
      rose: 'bg-rose-soft text-rose',
    },
  },
  defaultVariants: { tone: 'neutral' },
})

function Badge({ className, tone, dot, children, ...props }: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { dot?: boolean }) {
  return (
    <span className={cn(badgeVariants({ tone }), className)} {...props}>
      {dot && <i className="breathe-dot size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}

/* ---------- Avatar：带状态环 ---------- */
type Presence = 'busy' | 'idle' | 'off'
const presenceColor: Record<Presence, string> = { busy: 'bg-amber', idle: 'bg-mint', off: 'bg-ink-3' }

function Avatar({ src, size = 36, presence, ring, className }: { src: string, size?: number, presence?: Presence, ring?: boolean, className?: string }) {
  return (
    <span className={cn('relative inline-block shrink-0', className)} style={{ width: size, height: size }}>
      <img
        src={src}
        alt=""
        className={cn('size-full rounded-full border border-line bg-glass-2 object-cover', ring && 'ring-2 ring-volt ring-offset-2 ring-offset-bg')}
      />
      {presence && (
        <i className={cn('absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 border-[var(--solid)]', presenceColor[presence], presence === 'busy' && 'breathe-dot text-amber')} />
      )}
    </span>
  )
}

/* ---------- Kbd ---------- */
function Kbd({ children }: { children: React.ReactNode }) {
  return <kbd className="rounded-md border border-line-strong px-1.5 font-sans text-[11px] text-ink-3">{children}</kbd>
}

/* ---------- Progress：带流光 ---------- */
function Progress({ value, tone = 'volt' }: { value: number, tone?: 'volt' | 'cyan' | 'mint' }) {
  const bar = { volt: 'bg-volt', cyan: 'bg-cyan', mint: 'bg-mint' }[tone]
  return (
    <div className="h-1 overflow-hidden rounded-full bg-press" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <motion.div
        className={cn('h-full rounded-full', bar)}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.9, ease: ease.out, delay: 0.15 }}
      />
    </div>
  )
}

/* ---------- 空状态 / 骨架 ---------- */
function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-press', className)} />
}

function EmptyState({ icon, title, hint, action }: { icon: React.ReactNode, title: string, hint: string, action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <span className="grid size-11 place-items-center rounded-xl border border-line bg-surface text-ink-3">{icon}</span>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="mt-1 text-[13px] text-ink-3">{hint}</p>
      </div>
      {action}
    </div>
  )
}

export { Avatar, Badge, EmptyState, Kbd, Panel, Progress, Skeleton }
export type { Presence }
