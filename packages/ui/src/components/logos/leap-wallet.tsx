import type { SVGProps } from "react"
export function LeapWallet(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 80 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="2" y="8" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="11" cy="14" r="3" fill="currentColor" />
      <text x="26" y="17" fontSize="11" fontWeight="bold" fill="currentColor">Leap Wallet</text>
    </svg>
  )
}
