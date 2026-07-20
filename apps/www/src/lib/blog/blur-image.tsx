"use client"

import { useEffect, useState } from "react"

type ImgProps = React.ImgHTMLAttributes<HTMLImageElement>

export default function BlurImage(props: ImgProps) {
  const [loading, setLoading] = useState(true)
  const [src, setSrc] = useState(props.src)
  useEffect(() => setSrc(props.src), [props.src])

  return (
    <img
      {...props}
      src={src}
      alt={props.alt || ""}
      className={`${props.className} ${loading ? "blur-[2px]" : "blur-0"}`}
      onLoad={() => {
        setLoading(false)
      }}
      onError={() => {
        setSrc(`https://avatar.vercel.sh/${props.alt}`)
      }}
    />
  )
}
