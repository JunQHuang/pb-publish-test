import type { Transition, Variants } from 'motion/react'

// 动效 token：微交互 100-150ms，界面切换 200-300ms，页面 300-500ms；进场 ease-out/弹簧，退场更快更轻
export const spring = {
  snappy: { type: 'spring', stiffness: 520, damping: 38, mass: 0.8 } satisfies Transition,
  smooth: { type: 'spring', stiffness: 260, damping: 30 } satisfies Transition,
  // 只给有动量的手势用（拖拽、甩出）
  bouncy: { type: 'spring', stiffness: 320, damping: 18 } satisfies Transition,
}

export const ease = {
  out: [0.16, 1, 0.3, 1] as const,
  sheet: [0.32, 0.72, 0, 1] as const,
}

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 12, filter: 'blur(6px)' },
  enter: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.42, ease: ease.out, staggerChildren: 0.06, delayChildren: 0.04 } },
  exit: { opacity: 0, y: -6, filter: 'blur(4px)', transition: { duration: 0.18, ease: 'easeIn' } },
}

export const riseItem: Variants = {
  initial: { opacity: 0, y: 16 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.5, ease: ease.out } },
}
