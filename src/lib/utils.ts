import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const fmtPhone = (d: string) =>
  `+7 (${d.slice(0,3).padEnd(3,'_')}) ${d.slice(3,6).padEnd(3,'_')}-${d.slice(6,8).padEnd(2,'_')}-${d.slice(8,10).padEnd(2,'_')}`
