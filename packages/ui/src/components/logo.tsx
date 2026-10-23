import { cn } from '@louez/utils'

interface LogoProps {
  className?: string
  width?: number
  height?: number
}

export function Logo({ className, width = 21, height = 21 }: LogoProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 21 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('text-foreground', className)}
    >
      <path d="M2 8 4 2h13l2 6v11H2V8Zm0 0h17M7 19v-6h7v6M5 5h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Symbol on its own, for small spaces. Same artwork as apps/web/public/favicon.svg,
// which every generated icon is rendered from — change one, change the other.
export function LogoIcon({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
    >
      <path d="M3 9 5 3h14l2 6v11H3V9Zm0 0h18M8 20v-7h8v7M6 6h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
