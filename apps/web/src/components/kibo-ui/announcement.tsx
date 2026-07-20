import { type HTMLAttributes, type ReactNode } from "react"
import { cn } from "@/lib/utils"

export function Announcement({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-1.5 text-sm", className)} {...props}>
      {children}
    </div>
  )
}

export function AnnouncementTag({ className, children, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn("rounded-full bg-foreground px-2.5 py-0.5 text-xs font-medium text-background", className)} {...props}>
      {children}
    </span>
  )
}

export function AnnouncementTitle({ className, children, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn("text-muted-foreground", className)} {...props}>
      {children}
    </span>
  )
}
