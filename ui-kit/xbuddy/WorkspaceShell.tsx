/** RaccoonX shell presentation, source a16cd171. Platform/session operations are props.
 * Keep the original dimensions, ModuleMark, nav classes, fold handle and brand assets.
 */
import { useState } from 'react'
import { motion, MotionConfig } from 'motion/react'
import { RiDashboardLine, RiCheckboxCircleLine, RiFlagLine, RiFileList3Line, RiQuestionLine, RiArrowRightSLine, RiArrowLeftSLine } from '@remixicon/react'
import { ModuleMark, PageMarkContext } from './components/page-mark'
import { Avatar } from './components/ui/primitives'
import { Dialog } from './components/ui/dialog'
import { cn } from './lib/cn'
import { ease } from './lib/motion'
import mascot from './assets/raccoon-project.webp'

const marks = [
  { icon: RiDashboardLine, color: '#2563eb' },
  { icon: RiCheckboxCircleLine, color: '#12a594' },
  { icon: RiFlagLine, color: '#7c5cff' },
  { icon: RiFileList3Line, color: '#e8a317' },
]
type Item = { id: string, name: string, group?: string }
type Props = { title: string, navigation: Item[], tab: string, onNavigate: (id: string) => void, status: string, children: React.ReactNode }

export default function WorkspaceShell({ title, navigation, tab, onNavigate, status, children }: Props) {
  const [collapsed, setCollapsed] = useState(() => typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 639px)').matches)
  const [help, setHelp] = useState(false)
  const groups = [...new Set(navigation.map(n => n.group || (n.id === 'overview' ? '工作台' : '业务协作')))]
  const mark = marks[Math.max(0, navigation.findIndex(n => n.id === tab)) % marks.length]
  return <MotionConfig reducedMotion="user"><div className="xbuddy-app flex h-dvh min-h-0 flex-col overflow-hidden bg-bg text-ink" data-ui-template="xbuddy-ui@1.0.0">
    <header data-xbuddy-topbar className="flex h-12 shrink-0 items-center gap-3 border-b border-line bg-solid px-4">
      <div className="logo-mark h-7 w-[132px] shrink-0" role="img" aria-label="Raccoon X 智能体中台" />
      <span className="h-5 w-px shrink-0 bg-line" />
      <span className="truncate text-[13.5px] font-semibold">{title}</span>
      <span className="shrink-0 rounded bg-press px-1.5 py-0.5 text-[11.5px] text-ink-2 max-sm:hidden">工作空间</span>
      <div className="ml-auto flex shrink-0 items-center gap-1.5">
        <span role="status" className="rounded-md bg-volt-soft px-2 py-1 text-[12px] font-medium text-volt-text max-md:hidden">{status}</span>
        <button type="button" aria-label="使用帮助" onClick={() => setHelp(true)} className="grid size-8 cursor-pointer place-items-center rounded-md text-ink-3 hover:bg-hover hover:text-ink"><RiQuestionLine className="size-[18px]" /></button>
      </div>
    </header>
    <div className="relative flex min-h-0 flex-1">
      {!collapsed && <button aria-label="关闭导航遮罩" className="absolute inset-0 z-10 bg-black/20 sm:hidden" onClick={() => setCollapsed(true)} />}
      <div className="relative flex min-h-0 shrink-0 max-sm:z-20">
        <motion.aside id="global-sidebar" data-xbuddy-sidebar initial={false} animate={{ width: collapsed ? 0 : 228, opacity: collapsed ? 0 : 1 }} transition={{ duration: 0.42, ease: ease.sheet }} aria-hidden={collapsed} inert={collapsed} className="flex min-h-0 shrink-0 overflow-hidden bg-solid max-sm:absolute max-sm:inset-y-0 max-sm:left-0 max-sm:shadow-lg">
          <div className="flex min-h-0 w-[228px] shrink-0 flex-col border-r border-line">
            <div className="px-3 pt-3"><p className="px-2 py-2.5 text-sm font-semibold">工作空间</p></div>
            <nav aria-label="应用导航" className="mt-2 min-h-0 flex-1 space-y-4 overflow-auto px-3 pb-3">
              {groups.map(group => <div key={group}>
                <p className="mb-1 px-3 text-[11.5px] font-medium tracking-wide text-ink-3">{group}</p>
                <div className="space-y-0.5">{navigation.filter(n => (n.group || (n.id === 'overview' ? '工作台' : '业务协作')) === group).map(n => {
                  const selected = tab === n.id, m = marks[navigation.indexOf(n) % marks.length]
                  return <button key={n.id} type="button" data-buddy-nav={n.id} aria-current={selected ? 'page' : undefined} onClick={() => { onNavigate(n.id); if (window.matchMedia?.('(max-width: 639px)').matches) setCollapsed(true) }} className={cn('relative flex h-9 w-full cursor-pointer items-center gap-2.5 rounded-md px-3 text-[13.5px] transition-colors', selected ? 'bg-volt-soft font-semibold text-volt-text' : 'text-ink-2 hover:bg-hover hover:text-ink')}>
                    {selected && <span data-xbuddy-selection className="absolute top-2 bottom-2 -left-2 w-[3px] rounded-r bg-volt" />}
                    <ModuleMark {...m} size={22} /><span className="truncate">{n.name}</span>
                  </button>
                })}</div>
              </div>)}
            </nav>
            <div className="border-t border-line px-3 pb-3"><div className="mt-3 flex w-full items-center gap-2.5 rounded-lg p-2 text-left">
              <Avatar src={mascot} size={32} presence="idle" />
              <span className="min-w-0 flex-1 leading-tight"><span className="block truncate text-[13.5px] font-semibold">小浣熊，与你一起</span><span className="block truncate text-[11.5px] text-ink-3">{status}</span></span>
            </div></div>
          </div>
        </motion.aside>
        <button type="button" onClick={() => setCollapsed(v => !v)} aria-label={collapsed ? '展开应用导航' : '收起应用导航'} aria-expanded={!collapsed} aria-controls="global-sidebar" className={cn('absolute top-9 z-30 grid h-8 w-5 cursor-pointer place-items-center border border-line bg-solid text-ink-3 shadow-sm transition-colors hover:border-volt/40 hover:bg-volt-soft hover:text-volt-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-volt', collapsed ? 'left-0 rounded-r-md border-l-0' : '-right-2.5 rounded-md max-sm:right-auto max-sm:left-[218px]')}>
          {collapsed ? <RiArrowRightSLine className="size-4" /> : <RiArrowLeftSLine className="size-4" />}
        </button>
      </div>
      <PageMarkContext.Provider value={mark}><main className="xbuddy-content min-h-0 min-w-0 flex-1 overflow-auto">{children}</main></PageMarkContext.Provider>
    </div>
    <Dialog open={help} onOpenChange={setHelp} title="欢迎使用你的 Buddy" description="使用左侧菜单切换工作视图；导航可以折叠，在手机上也能展开。" size="sm">
      <div className="flex items-center gap-4"><img src={mascot} alt="小浣熊项目伙伴" className="size-20" /><p className="text-[13px] leading-relaxed text-ink-2">新增、编辑的业务数据会自动保存。请等保存状态确认后再关闭页面。你也可以回到开发助手，继续描述需要改进的功能。</p></div>
    </Dialog>
  </div></MotionConfig>
}
