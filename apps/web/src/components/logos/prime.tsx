import type { SVGProps } from "react"
export function Primevideo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 80 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M4 4h16v16H4V4z" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M8 12l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <text x="28" y="17" fontSize="13" fontWeight="bold" fill="currentColor">Prime Video</text>
    </svg>
  )
}
