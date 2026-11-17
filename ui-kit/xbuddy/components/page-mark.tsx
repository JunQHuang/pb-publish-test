import { createContext, useContext } from 'react'

/*
  带颜色的模块标识（2026-11-08，参照 ProjectBuddy）：每个导航模块一个彩色圆角方块 ＋ 白色图标，
  渐变 ＋ 顶部高光 ＋ 轻投影，左侧导航与页面标题共用，让模块一眼可辨、更立体。
*/
export type Mark = { icon: React.ComponentType<{ className?: string }>, color: string }

export function ModuleMark({ icon: Icon, color, size = 22, className }: Mark & { size?: number, className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={'relative grid shrink-0 place-items-center overflow-hidden rounded-[6px] text-white ' + (className ?? '')}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(145deg, color-mix(in srgb, ${color} 78%, white) 0%, ${color} 55%, color-mix(in srgb, ${color} 82%, black) 100%)`,
        boxShadow: `0 1px 2px color-mix(in srgb, ${color} 40%, transparent), 0 2px 6px color-mix(in srgb, ${color} 22%, transparent), inset 0 1px 0 rgba(255,255,255,.35)`,
      }}
    >
      <span className="relative grid place-items-center [&_svg]:size-full" style={{ width: Math.round(size * 0.62), height: Math.round(size * 0.62) }}><Icon /></span>
    </span>
  )
}

/** 当前页所属模块的标识（App 按路由提供，PageHeader 读取） */
export const PageMarkContext = createContext<Mark | null>(null)
export const usePageMark = () => useContext(PageMarkContext)
