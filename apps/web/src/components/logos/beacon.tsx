import type { SVGProps } from "react"
export function Beacon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="12" cy="12" r="3" fill="currentColor" opacity={0.5} />
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" opacity={0.3} />
      <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="1" opacity={0.15} />
    </svg>
  )
}
