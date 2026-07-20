import type { SVGProps } from "react"
export function Polars(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 60 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="2" y="6" width="6" height="12" rx="1" fill="currentColor" />
      <rect x="10" y="4" width="6" height="16" rx="1" fill="currentColor" />
      <rect x="18" y="8" width="6" height="8" rx="1" fill="currentColor" />
      <text x="30" y="17" fontSize="13" fontWeight="bold" fill="currentColor">Polars</text>
    </svg>
  )
}
