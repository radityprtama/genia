import type { SVGProps } from "react"
export function VercelFull(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 60 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M12 3L3 21h18L12 3z" fill="currentColor" />
      <text x="22" y="17" fontSize="12" fontWeight="bold" fill="currentColor">Vercel</text>
    </svg>
  )
}
