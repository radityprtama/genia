import type { SVGProps } from "react"
export function OpenAIFull(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 80 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M12 2L2 22h10l4-8 4 8h10L12 2z" fill="currentColor" opacity={0.8} />
      <circle cx="12" cy="16" r="3" fill="currentColor" />
      <path d="M24 6l-4 8h8l-4-8z" fill="currentColor" opacity={0.6} />
      <text x="34" y="18" fontSize="14" fontWeight="bold" fill="currentColor">OpenAI</text>
    </svg>
  )
}
