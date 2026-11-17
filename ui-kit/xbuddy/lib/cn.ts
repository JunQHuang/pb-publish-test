import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// 与 frontend/packages/dify-ui/src/cn.ts 同一写法，组件可以直接迁移
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
