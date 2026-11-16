import { RiArrowRightSLine } from '@remixicon/react'
import { ModuleMark, usePageMark } from './page-mark'
import { cn } from '../lib/cn'
export type TabItem<T extends string> = { id: T, label: string, count?: number, hidden?: boolean }

export function Tabs<T extends string>({ items, value, onChange, className }: { items: TabItem<T>[], value: T, onChange: (v: T) => void, className?: string }) {
  return (
    <div role="tablist" className={cn('flex gap-6 border-b border-line', className)}>
      {items.filter(i => !i.hidden).map(i => (
        <button
          key={i.id}
          type="button"
          role="tab"
          aria-selected={value === i.id}
          onClick={() => onChange(i.id)}
          className={cn('relative -mb-px flex h-10 cursor-pointer items-center gap-1.5 border-b-2 text-[13.5px] whitespace-nowrap transition-colors', value === i.id ? 'border-volt font-semibold text-volt-text' : 'border-transparent text-ink-2 hover:text-ink')}
        >
          {i.label}
          {i.count !== undefined && <span className={cn('rounded px-1.5 text-[11.5px] tabular-nums', value === i.id ? 'bg-volt-soft text-volt-text' : 'bg-press text-ink-3')}>{i.count}</span>}
        </button>
      ))}
    </div>
  )
}

export function PageHeader<T extends string>({ title, desc, actions, crumbs, tabs, tab, onTab, meta }: {
  title: React.ReactNode
  desc?: React.ReactNode
  actions?: React.ReactNode
  crumbs?: { label: string, onClick?: () => void }[]
  tabs?: TabItem<T>[]
  tab?: T
  onTab?: (t: T) => void
  meta?: React.ReactNode
}) {
  const mark = usePageMark()
  return (
    <header className="shrink-0 border-b border-line bg-solid px-6 pt-4">
      {crumbs && (
        <nav className="mb-1.5 flex items-center gap-1 text-[12.5px] text-ink-3" aria-label="面包屑">
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <RiArrowRightSLine className="size-3.5" />}
              {c.onClick ? <button type="button" className="cursor-pointer hover:text-volt-text" onClick={c.onClick}>{c.label}</button> : <span>{c.label}</span>}
            </span>
          ))}
        </nav>
      )}
      <div className={cn('flex items-start gap-4', !tabs && 'pb-4')}>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">{mark && <ModuleMark icon={mark.icon} color={mark.color} size={28} />}<h1 className="text-[20px] leading-7 font-semibold">{title}</h1>{meta}</div>
          {desc && <p className="mt-1 text-[13px] text-ink-2">{desc}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
      {tabs && tab && onTab && <Tabs className="mt-3 border-b-0" items={tabs} value={tab} onChange={onTab} />}
    </header>
  )
}

export function ConsolePage({ header, children, className, bodyClass }: { header: React.ReactNode, children: React.ReactNode, className?: string, bodyClass?: string }) {
  return (
    <section className={cn('relative flex min-h-0 flex-1 flex-col', className)}>
      {header}
      <div className={cn('min-h-0 flex-1 overflow-auto p-6', bodyClass)}>{children}</div>
    </section>
  )
}

export function Section({ title, desc, actions, children, className, bodyClass, id }: { title?: React.ReactNode, desc?: React.ReactNode, actions?: React.ReactNode, children: React.ReactNode, className?: string, bodyClass?: string, id?: string }) {
  return (
    <section id={id} className={cn('scroll-mt-4 rounded-xl border border-line bg-solid', className)}>
      {(title || actions) && (
        <div className="flex items-start gap-3 border-b border-line px-5 py-3.5">
          <div className="min-w-0 flex-1">
            {title && <h2 className="text-[14.5px] font-semibold">{title}</h2>}
            {desc && <p className="mt-0.5 text-[12.5px] text-ink-3">{desc}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={cn('p-5', bodyClass)}>{children}</div>
    </section>
  )
}

