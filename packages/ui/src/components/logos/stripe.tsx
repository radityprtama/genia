import type { SVGProps } from "react"
export function Stripe(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 80 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="2" y="6" width="20" height="12" rx="3" fill="currentColor" />
      <text x="30" y="17" fontSize="13" fontWeight="bold" fill="currentColor">Stripe</text>
    </svg>
  )
}
