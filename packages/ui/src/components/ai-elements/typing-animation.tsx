"use client"

import { useEffect, useState } from "react"

interface TypingAnimationProps {
  words: string[]
}

export function TypingAnimation({ words }: TypingAnimationProps) {
  const [index, setIndex] = useState(0)
  const [char, setChar] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const word = words[index]
    if (!word) return

    const timeout = setTimeout(() => {
      if (!deleting) {
        if (char < word.length) {
          setChar((c) => c + 1)
        } else {
          setTimeout(() => setDeleting(true), 1500)
        }
      } else {
        if (char > 0) {
          setChar((c) => c - 1)
        } else {
          setDeleting(false)
          setIndex((i) => (i + 1) % words.length)
        }
      }
    }, deleting ? 30 : 80)

    return () => clearTimeout(timeout)
  }, [char, deleting, index, words])

  return (
    <span className="inline-flex items-center">
      {words[index]?.slice(0, char)}
      <span className="animate-pulse ml-px h-4 w-[2px] bg-current" />
    </span>
  )
}
